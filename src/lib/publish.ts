import { db } from './firebase';
import type { KeywordEntry, Article, ArticleSummary } from './types';

const KEYWORDS_COLLECTION = 'keywords_beauty';
const ARTICLES_COLLECTION = 'articles';
const INDEX_COLLECTION = 'articles_index';
const INDEX_DOC_SIZE_WARN = 800_000; // warn when approaching 1MB Firestore limit

function toArticleSummary(article: Article): ArticleSummary {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    metaDescription: article.metaDescription,
    publishedAt: article.publishedAt,
    category: article.category,
    specialty: article.specialty,
    lang: article.lang,
  };
}

async function upsertArticlesIndex(lang: string, category: string, summary: ArticleSummary): Promise<void> {
  const ref = db.collection(INDEX_COLLECTION).doc(`${lang}_${category}`);
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const existing: ArticleSummary[] = snap.exists ? ((snap.data()?.items as ArticleSummary[]) || []) : [];
    const filtered = existing.filter(x => x.id !== summary.id);
    filtered.unshift(summary);
    filtered.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
    const payload = {
      lang,
      category,
      items: filtered,
      updatedAt: new Date().toISOString(),
      count: filtered.length,
    };
    tx.set(ref, payload);
    const approxBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
    if (approxBytes > INDEX_DOC_SIZE_WARN) {
      console.warn(`[Index] articles_index/${lang}_${category} ~${(approxBytes / 1024).toFixed(1)}KB (count=${filtered.length}) - approaching 1MB limit; consider sharding by specialty`);
    }
  });
}

// --- Initialize keyword queue in Firestore ---
export async function initializeKeywordQueue(): Promise<number> {
  const { generateAllKeywords } = await import('./keywords');
  const keywords = generateAllKeywords();
  const batch = db.batch();
  let count = 0;

  for (const kw of keywords) {
    const ref = db.collection(KEYWORDS_COLLECTION).doc(kw.id);
    const doc = await ref.get();
    if (!doc.exists) {
      batch.set(ref, kw);
      count++;
    }
    // Firestore batches support max 500 operations
    if (count > 0 && count % 450 === 0) {
      await batch.commit();
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  console.log(`[Publish] Initialized ${count} new keywords (total: ${keywords.length})`);
  return count;
}

// --- Get next pending keyword ---
export async function getNextPendingKeyword(): Promise<KeywordEntry | null> {
  // Avoid composite index: query by status only, sort in JS
  // Include 'failed' keywords so they get retried automatically
  const snapshot = await db.collection(KEYWORDS_COLLECTION)
    .where('status', 'in', ['pending', 'failed'])
    .limit(100)
    .get();

  if (snapshot.empty) return null;
  const candidates = snapshot.docs
    .map(doc => doc.data() as KeywordEntry)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  return candidates[0];
}

// --- Publish a single article ---
export async function publishArticle(): Promise<{ success: boolean; keyword?: string; articlesCreated?: number; error?: string }> {
  try {
    // Initialize queue if needed
    const queueCheck = await db.collection(KEYWORDS_COLLECTION).limit(1).get();
    if (queueCheck.empty) {
      console.log('[Publish] Queue empty, initializing...');
      await initializeKeywordQueue();
    }

    // Get next keyword
    const keyword = await getNextPendingKeyword();
    if (!keyword) {
      return { success: false, error: 'No pending keywords' };
    }

    console.log(`[Publish] Processing keyword: ${keyword.keyword}`);

    // Mark as in_progress
    await db.collection(KEYWORDS_COLLECTION).doc(keyword.id).update({
      status: 'in_progress',
    });

    try {
      // Scrape hospital data (dynamic import to avoid loading puppeteer on page renders)
      const { scrapeHospitalData } = await import('./scraper');
      const hospitals = await scrapeHospitalData(keyword.keyword);

      if (hospitals.length === 0) {
        // Try without specialty
        console.log('[Publish] No results with specialty, trying region-only search');
        const categoryLabel = keyword.category === 'dental' ? '치과' : '피부과';
        const fallbackQuery = `${keyword.region} ${categoryLabel}`;
        const fallbackHospitals = await scrapeHospitalData(fallbackQuery);

        if (fallbackHospitals.length === 0) {
          await db.collection(KEYWORDS_COLLECTION).doc(keyword.id).update({
            status: 'failed',
          });
          return { success: false, keyword: keyword.keyword, error: 'No hospitals found' };
        }

        // Use fallback results
        hospitals.push(...fallbackHospitals);
      }

      // Generate articles in all languages (dynamic import to avoid loading anthropic SDK on page renders)
      const { generateAllLanguageArticles } = await import('./generator');
      const articles = await generateAllLanguageArticles(keyword, hospitals);

      // Save all articles to Firestore
      const batch = db.batch();
      for (const article of articles) {
        const ref = db.collection(ARTICLES_COLLECTION).doc(article.id);
        // Don't store full hospitals array in every article (save space)
        const articleData = {
          ...article,
          hospitals: article.hospitals.map((h: { id: string; name: string; address: string; phone: string; businessHours: string; specialistsInfo: string; naverReviewCount: number; kakaoRating: number | null; kakaoReviewCount: number }) => ({
            id: h.id,
            name: h.name,
            address: h.address,
            phone: h.phone,
            businessHours: h.businessHours,
            specialistsInfo: h.specialistsInfo,
            naverReviewCount: h.naverReviewCount,
            kakaoRating: h.kakaoRating,
            kakaoReviewCount: h.kakaoReviewCount,
          })),
        };
        batch.set(ref, articleData);
      }

      // Mark keyword as published
      batch.update(db.collection(KEYWORDS_COLLECTION).doc(keyword.id), {
        status: 'published',
        publishedAt: new Date().toISOString(),
      });

      await batch.commit();

      // Update pre-aggregated index docs (articles_index/{lang}_{category}) — one per language.
      try {
        await Promise.all(
          articles.map((a: Article) => upsertArticlesIndex(a.lang, a.category, toArticleSummary(a)))
        );
      } catch (e) {
        console.error('[Publish] Index upsert failed (articles still saved):', e instanceof Error ? e.message : e);
      }

      // Invalidate the 'articles' cache tag so readers see the new article immediately.
      // revalidateTag requires Next.js server context; wrap in try/catch for standalone callers.
      try {
        const { revalidateTag } = await import('next/cache');
        revalidateTag('articles', { expire: 0 });
      } catch (e) {
        console.log('[Publish] revalidateTag skipped (no Next.js context):', e instanceof Error ? e.message : e);
      }

      console.log(`[Publish] Published ${articles.length} articles for "${keyword.keyword}"`);
      return {
        success: true,
        keyword: keyword.keyword,
        articlesCreated: articles.length,
      };
    } catch (error) {
      console.error(`[Publish] Failed for "${keyword.keyword}":`, error);
      await db.collection(KEYWORDS_COLLECTION).doc(keyword.id).update({
        status: 'failed',
      });
      return {
        success: false,
        keyword: keyword.keyword,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  } catch (error) {
    console.error('[Publish] Fatal error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Note: list/detail/sitemap readers moved to src/lib/articles.ts (with unstable_cache).
// Previous duplicate getArticles/getArticle/getAllArticleSlugs removed — no callers used them.
