import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import type { ArticlesIndex } from '@/lib/types';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

const INDEXNOW_KEY = '269f3ef87ad6a3c78368bdcd01094c82';
const SITE_HOST = 'www.medicalkoreaguide.com';
const SITE_URL = 'https://www.medicalkoreaguide.com';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log(`[IndexNow Cron] Triggered at ${new Date().toISOString()}`);

  // Collect URLs published in last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const urls: string[] = [];

  // Read pre-aggregated index docs (13 reads) instead of scanning the full articles collection (~117K reads).
  const indexSnaps = await Promise.all(
    SUPPORTED_LANGUAGES.map(lang =>
      db.collection('articles_index').doc(`${lang}_dermatology`).get()
    )
  );
  const anyMissing = indexSnaps.some(s => !s.exists);

  if (!anyMissing) {
    for (const s of indexSnaps) {
      const data = s.data() as ArticlesIndex | undefined;
      for (const item of data?.items ?? []) {
        if (item.publishedAt && item.publishedAt >= since && item.category === 'dermatology') {
          urls.push(`${SITE_URL}/${item.lang}/${item.category}/${item.slug}`);
        }
      }
    }
  } else {
    // Fallback: legacy full-collection scan until migration populates all index docs.
    console.warn('[IndexNow Cron] Some articles_index docs missing — falling back to full scan');
    const snap = await db.collection('articles').get();
    snap.forEach(doc => {
      const d = doc.data();
      if (d.publishedAt && d.publishedAt >= since && d.category === 'dermatology') {
        urls.push(`${SITE_URL}/${d.lang}/${d.category}/${d.slug}`);
      }
    });
  }

  if (urls.length === 0) {
    return Response.json({ message: 'No new URLs in last 24h', submitted: 0 });
  }

  const uniqueUrls = [...new Set(urls)];
  const body = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: uniqueUrls.slice(0, 10000),
  };

  const results: { engine: string; status: number }[] = [];

  for (const engine of ['https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow', 'https://searchadvisor.naver.com/indexnow']) {
    try {
      const res = await fetch(engine, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
      });
      results.push({ engine, status: res.status });
    } catch {
      results.push({ engine, status: 0 });
    }
  }

  console.log(`[IndexNow Cron] Submitted ${uniqueUrls.length} URLs`);
  return Response.json({ submitted: uniqueUrls.length, results });
}
