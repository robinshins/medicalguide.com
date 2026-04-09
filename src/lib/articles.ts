import { db } from './firebase';
import type { Article } from './types';

const ARTICLES_COLLECTION = 'articles';

// --- Get published articles (no composite index needed) ---
export async function getArticles(lang: string, category?: string, limit?: number): Promise<Article[]> {
  let query: FirebaseFirestore.Query = db.collection(ARTICLES_COLLECTION)
    .where('lang', '==', lang);

  if (category) {
    query = query.where('category', '==', category);
  }

  const snapshot = await query.get();
  const articles = snapshot.docs.map(doc => doc.data() as Article);

  // Sort in JS to avoid needing composite index
  articles.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  return limit ? articles.slice(0, limit) : articles;
}

// --- Get single article ---
export async function getArticle(lang: string, category: string, slug: string): Promise<Article | null> {
  const id = `${category}-${slug}-${lang}`;
  const doc = await db.collection(ARTICLES_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return doc.data() as Article;
}

// --- Get all articles for sitemap ---
export async function getAllArticleSlugs(): Promise<{ lang: string; category: string; slug: string; publishedAt?: string }[]> {
  const snapshot = await db.collection(ARTICLES_COLLECTION)
    .select('lang', 'category', 'slug', 'publishedAt')
    .get();

  return snapshot.docs
    .map(doc => {
      const data = doc.data();
      return { lang: data.lang, category: data.category, slug: data.slug, publishedAt: data.publishedAt };
    })
    .filter(a => a.category === 'dermatology');
}
