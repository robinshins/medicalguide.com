// IndexNow streaming submission.
// Reads URLs from .indexnow-pending.txt (written by publish-action.js
// for the article that was just published) and submits each one via GET.
// This guarantees we only push URLs from the current run — no time-window
// guessing, no duplicate re-submission across the 30-min cron interval.

const fs = require('fs');
const path = require('path');

const INDEXNOW_KEY = '269f3ef87ad6a3c78368bdcd01094c82';
const SITE_URL = 'https://www.medicalkoreaguide.com';
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
const PENDING_FILE = path.join(__dirname, '.indexnow-pending.txt');

// Streaming endpoints (one URL per GET request)
const ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://searchadvisor.naver.com/indexnow',
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function submitOne(url) {
  const qs = `url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}&keyLocation=${encodeURIComponent(KEY_LOCATION)}`;
  for (const base of ENDPOINTS) {
    try {
      const res = await fetch(`${base}?${qs}`, { method: 'GET' });
      console.log(`  [${res.status}] ${base.replace(/^https?:\/\//, '')} ${url}`);
    } catch (e) {
      console.log(`  [ERR] ${base.replace(/^https?:\/\//, '')} ${url} - ${e.message}`);
    }
  }
}

async function main() {
  if (!fs.existsSync(PENDING_FILE)) {
    console.log('[IndexNow] No pending URL file. Nothing to submit.');
    process.exit(0);
  }

  const raw = fs.readFileSync(PENDING_FILE, 'utf8');
  const urls = [...new Set(
    raw.split('\n').map(s => s.trim()).filter(Boolean)
  )];

  if (urls.length === 0) {
    console.log('[IndexNow] Pending file is empty. Skipping.');
    fs.unlinkSync(PENDING_FILE);
    process.exit(0);
  }

  console.log(`[IndexNow] Streaming ${urls.length} URLs from current run...`);
  for (const url of urls) {
    await submitOne(url);
    await sleep(250);
  }

  // Consume the file so the next run starts fresh.
  fs.unlinkSync(PENDING_FILE);
  console.log('[IndexNow] Done. Pending file cleared.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
