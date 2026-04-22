/**
 * One-shot migration: build articles_index/{lang}_{category} docs from the existing articles collection.
 *
 * Usage:
 *   node scripts/build-articles-index.js
 *
 * Safe to re-run — each index doc is overwritten (not appended).
 * Recommend pausing GitHub Actions publish while this runs to avoid lost writes.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const SA_PATH = path.join(__dirname, '..', 'medicalkorea-2205a-firebase-adminsdk-fbsvc-70fd6e21f4.json');
if (!fs.existsSync(SA_PATH)) {
  console.error(`Service account file not found at ${SA_PATH}`);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))),
  storageBucket: 'medicalkorea-2205a.firebasestorage.app',
});
const db = admin.firestore();

const INDEX_DOC_SIZE_WARN = 800_000;

function toSummary(d) {
  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    metaDescription: d.metaDescription,
    publishedAt: d.publishedAt,
    category: d.category,
    specialty: d.specialty,
    lang: d.lang,
  };
}

async function main() {
  const started = Date.now();
  console.log('[Migrate] Reading all articles (summary fields only)...');

  const snap = await db.collection('articles')
    .select('id', 'slug', 'title', 'metaDescription', 'publishedAt', 'category', 'specialty', 'lang')
    .get();

  console.log(`[Migrate] Read ${snap.size} article docs in ${((Date.now() - started) / 1000).toFixed(1)}s`);

  // This site is dermatology-only. Skip dental docs that exist in the shared Firestore
  // so we never build articles_index/{lang}_dental.
  const ALLOWED_CATEGORY = 'dermatology';
  let skipped = 0;
  const groups = new Map(); // key: `${lang}_${category}` -> summaries[]
  snap.forEach(doc => {
    const d = doc.data();
    if (!d.lang || !d.category) return;
    if (d.category !== ALLOWED_CATEGORY) { skipped++; return; }
    const key = `${d.lang}_${d.category}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(toSummary(d));
  });
  if (skipped > 0) console.log(`[Migrate] Skipped ${skipped} non-${ALLOWED_CATEGORY} docs`);

  console.log(`[Migrate] Grouped into ${groups.size} index docs. Writing...`);

  const now = new Date().toISOString();
  let warned = 0;
  for (const [key, items] of groups.entries()) {
    items.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
    const [lang, category] = key.split('_');
    const payload = {
      lang,
      category,
      items,
      updatedAt: now,
      count: items.length,
    };
    const approxBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
    await db.collection('articles_index').doc(key).set(payload);
    const warn = approxBytes > INDEX_DOC_SIZE_WARN;
    if (warn) warned++;
    console.log(`  ${warn ? '⚠' : '✓'} ${key}: ${items.length} items, ~${(approxBytes / 1024).toFixed(1)}KB`);
  }

  console.log(`\n[Migrate] Done: ${groups.size} index docs written in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  if (warned > 0) {
    console.warn(`[Migrate] ${warned} doc(s) exceed ${INDEX_DOC_SIZE_WARN / 1000}KB — plan to shard by specialty before hitting 1MB.`);
  }
  process.exit(0);
}

main().catch(e => {
  console.error('[Migrate] Failed:', e);
  process.exit(1);
});
