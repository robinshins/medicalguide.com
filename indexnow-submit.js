const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// --- Init ---
const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'medicalkorea-2205a-firebase-adminsdk-fbsvc-70fd6e21f4.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount), storageBucket: 'medicalkorea-2205a.firebasestorage.app' });
const db = admin.firestore();

const INDEXNOW_KEY = 'c3452bc6ba68afc0a9746c8a940551a6';
const SITE_HOST = 'medicalguide.co.kr';
const SITE_URL = 'https://medicalguide.co.kr';

async function main() {
  console.log('[IndexNow] Collecting URLs published in last 24 hours...');

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const snap = await db.collection('articles').get();

  const urls = [];
  snap.forEach(doc => {
    const d = doc.data();
    if (d.publishedAt && d.publishedAt >= since) {
      urls.push(`${SITE_URL}/${d.lang}/${d.category}/${d.slug}`);
    }
  });

  if (urls.length === 0) {
    console.log('[IndexNow] No new URLs in last 24h. Skipping.');
    process.exit(0);
  }

  // Deduplicate
  const uniqueUrls = [...new Set(urls)];
  console.log(`[IndexNow] Found ${uniqueUrls.length} URLs to submit`);
  uniqueUrls.slice(0, 10).forEach(u => console.log('  ' + u));
  if (uniqueUrls.length > 10) console.log(`  ... and ${uniqueUrls.length - 10} more`);

  // Submit to IndexNow (Bing endpoint, shared with Yandex/Naver)
  const body = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: uniqueUrls.slice(0, 10000),
  };

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    console.log(`[IndexNow] api.indexnow.org: ${response.status} ${response.statusText}`);
  } catch (e) {
    console.log('[IndexNow] api.indexnow.org failed:', e.message);
  }

  // Also submit to Bing directly
  try {
    const response = await fetch('https://www.bing.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    console.log(`[IndexNow] bing.com: ${response.status} ${response.statusText}`);
  } catch (e) {
    console.log('[IndexNow] bing.com failed:', e.message);
  }

  // Submit to Naver
  try {
    const response = await fetch('https://searchadvisor.naver.com/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    console.log(`[IndexNow] naver.com: ${response.status} ${response.statusText}`);
  } catch (e) {
    console.log('[IndexNow] naver.com failed:', e.message);
  }

  console.log('[IndexNow] Done!');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
