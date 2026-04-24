import { unstable_cache } from 'next/cache';
import { db } from './firebase';
import type { Article, ArticlesIndex, ArticleSummary } from './types';
import { SUPPORTED_LANGUAGES } from './i18n';

const ARTICLES_COLLECTION = 'articles';
const INDEX_COLLECTION = 'articles_index';
const CACHE_REVALIDATE = 21600; // 6h — invalidated eagerly by /api/revalidate on publish
const CACHE_TAG = 'articles';

// This site serves dermatology only. The shared Firestore also contains dental articles
// (from the original medicalkoreaguide project) — defensively filter them everywhere.
const ALLOWED_CATEGORY = 'dermatology';

// Re-export for existing callers that import ArticleSummary from this module.
export type { ArticleSummary } from './types';

async function readIndex(lang: string, category: string): Promise<ArticleSummary[] | null> {
  const snap = await db.collection(INDEX_COLLECTION).doc(`${lang}_${category}`).get();
  if (!snap.exists) return null;
  const data = snap.data() as ArticlesIndex | undefined;
  return data?.items ?? [];
}

// Legacy fallback: full-scan by lang (+category), used only when no index doc exists.
async function legacyFetchArticles(lang: string, category?: string): Promise<ArticleSummary[]> {
  let query: FirebaseFirestore.Query = db.collection(ARTICLES_COLLECTION)
    .where('lang', '==', lang)
    .select('id', 'slug', 'title', 'metaDescription', 'publishedAt', 'category', 'specialty', 'lang');
  if (category) query = query.where('category', '==', category);
  const snapshot = await query.get();
  const articles = snapshot.docs.map(doc => doc.data() as ArticleSummary);
  articles.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  return articles;
}

// --- Get published articles ---
// Reads pre-aggregated index doc (1 read) when available, falls back to full-scan during migration.
// Always restricts results to ALLOWED_CATEGORY — this site is dermatology-only.
export const getArticles = unstable_cache(
  async (lang: string, category?: string, limit?: number): Promise<ArticleSummary[]> => {
    if (category && category !== ALLOWED_CATEGORY) return [];
    let items: ArticleSummary[] | null = await readIndex(lang, ALLOWED_CATEGORY);
    if (items === null) {
      items = await legacyFetchArticles(lang, ALLOWED_CATEGORY);
    }
    return limit ? items.slice(0, limit) : items;
  },
  ['getArticles'],
  { revalidate: CACHE_REVALIDATE, tags: [CACHE_TAG] }
);

// --- Get single article ---
// Intentionally NOT restricted to ALLOWED_CATEGORY: pre-existing ChatGPT/search citations
// like /ko/dental/busan-full-implant must keep resolving even though we no longer promote
// dental (listing + sitemap still dermatology-only).
export const getArticle = unstable_cache(
  async (lang: string, category: string, slug: string): Promise<Article | null> => {
    const id = `${category}-${slug}-${lang}`;
    const doc = await db.collection(ARTICLES_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Article;
  },
  ['getArticle'],
  { revalidate: CACHE_REVALIDATE, tags: [CACHE_TAG] }
);

// --- Get all articles for sitemap ---
// Reads one index doc per language (13 reads) instead of full-scanning the articles collection.
export const getAllArticleSlugs = unstable_cache(
  async (): Promise<{ lang: string; category: string; slug: string; publishedAt?: string }[]> => {
    const perLang = await Promise.all(
      SUPPORTED_LANGUAGES.map(lang => readIndex(lang, 'dermatology').then(items => ({ lang, items })))
    );

    const anyMissing = perLang.some(r => r.items === null);
    if (!anyMissing) {
      return perLang.flatMap(r =>
        (r.items ?? []).map(a => ({
          lang: r.lang,
          category: a.category,
          slug: a.slug,
          publishedAt: a.publishedAt,
        }))
      );
    }

    // Fallback: at least one language's index is missing — full scan.
    const snapshot = await db.collection(ARTICLES_COLLECTION)
      .select('lang', 'category', 'slug', 'publishedAt')
      .get();
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        return { lang: data.lang, category: data.category, slug: data.slug, publishedAt: data.publishedAt };
      })
      .filter(a => a.category === 'dermatology');
  },
  ['getAllArticleSlugs'],
  { revalidate: CACHE_REVALIDATE, tags: [CACHE_TAG] }
);
