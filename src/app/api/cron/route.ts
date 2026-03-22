import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

const INDEXNOW_KEY = '269f3ef87ad6a3c78368bdcd01094c82';
const SITE_HOST = 'medicalkoreaguide.com';
const SITE_URL = 'https://medicalkoreaguide.com';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log(`[IndexNow Cron] Triggered at ${new Date().toISOString()}`);

  // Collect URLs published in last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const snap = await db.collection('articles').get();

  const urls: string[] = [];
  snap.forEach(doc => {
    const d = doc.data();
    if (d.publishedAt && d.publishedAt >= since && d.category === 'dermatology') {
      urls.push(`${SITE_URL}/${d.lang}/${d.category}/${d.slug}`);
    }
  });

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
