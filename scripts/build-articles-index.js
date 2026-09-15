/**
 * Rebuild the sharded articles_index from the articles collection.
 *
 * Layout (keep in sync with publish-action.js / src/lib/publish.ts / src/lib/articles.ts):
 *   articles_index/{lang}_dermatology      head: newest <= INDEX_SHARD_MAX_ITEMS summaries
 *   articles_index/{lang}_dermatology_a1   archive shard 1 (oldest)
 *   articles_index/{lang}_dermatology_aN   archive shard N (newest of the archive)
 *
 * Usage:
 *   node scripts/build-articles-index.js
 *
 * Safe to re-run — every shard is overwritten and stale shards are deleted.
 * Run it when the index drifts (e.g. after an upsert failure) or the layout changes.
 * Avoid overlapping with a GitHub Actions publish run to prevent lost writes.
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

const INDEX_COLLECTION = 'articles_index';
const INDEX_DOC_SIZE_WARN = 800_000;
const INDEX_SHARD_MAX_ITEMS = 400; // must match publish-action.js and src/lib/publish.ts
const ALLOWED_CATEGORY = 'dermatology'; // this site is dermatology-only; dental docs in the shared DB are skipped

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

// Split a publishedAt-desc list into {docId -> items}: head first, then archive shards
// numbered so that _a1 is the oldest and the highest number is the newest.
function shardItems(headId, items) {
  const docs = new Map();
  docs.set(headId, items.slice(0, INDEX_SHARD_MAX_ITEMS));
  const rest = items.slice(INDEX_SHARD_MAX_ITEMS);
  const chunks = [];
  for (let i = 0; i < rest.length; i += INDEX_SHARD_MAX_ITEMS) chunks.push(rest.slice(i, i + INDEX_SHARD_MAX_ITEMS));
  // chunks[0] is the newest of the archive -> gets the highest shard number
  chunks.forEach((chunk, i) => docs.set(`${headId}_a${chunks.length - i}`, chunk));
  return docs;
}

async function main() {
  const started = Date.now();
  console.log('[Rebuild] Reading all articles (summary fields only)...');

  const snap = await db.collection('articles')
    .select('id', 'slug', 'title', 'metaDescription', 'publishedAt', 'category', 'specialty', 'lang')
    .get();
  console.log(`[Rebuild] Read ${snap.size} article docs in ${((Date.now() - started) / 1000).toFixed(1)}s`);

  let skipped = 0;
  const byLang = new Map();
  snap.forEach(doc => {
    const d = doc.data();
    if (!d.lang || !d.category) return;
    if (d.category !== ALLOWED_CATEGORY) { skipped++; return; }
    if (!byLang.has(d.lang)) byLang.set(d.lang, []);
    byLang.get(d.lang).push(toSummary(d));
  });
  if (skipped > 0) console.log(`[Rebuild] Skipped ${skipped} non-${ALLOWED_CATEGORY} docs`);

  const existing = await db.collection(INDEX_COLLECTION).select().get();
  const existingIds = new Set(existing.docs.map(d => d.id));

  const now = new Date().toISOString();
  const written = new Set();
  let warned = 0;
  for (const [lang, items] of byLang.entries()) {
    items.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
    const headId = `${lang}_${ALLOWED_CATEGORY}`;
    const docs = shardItems(headId, items);
    let shardNo = 0;
    for (const [id, shard] of docs) {
      const payload = {
        lang,
        category: ALLOWED_CATEGORY,
        shard: id === headId ? 0 : parseInt(id.slice(headId.length + 2), 10),
        items: shard,
        count: shard.length,
        totalCount: items.length,
        updatedAt: now,
      };
      const approxBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');
      await db.collection(INDEX_COLLECTION).doc(id).set(payload);
      written.add(id);
      const warn = approxBytes > INDEX_DOC_SIZE_WARN;
      if (warn) warned++;
      console.log(`  ${warn ? '!' : 'ok'} ${id}: ${shard.length} items, ~${(approxBytes / 1024).toFixed(1)}KB`);
      shardNo++;
    }
    console.log(`  ${lang}: ${items.length} items across ${shardNo} doc(s)`);
  }

  // Remove stale docs from a previous layout (e.g. archive shards that no longer exist).
  let deleted = 0;
  for (const id of existingIds) {
    if (written.has(id)) continue;
    if (!id.endsWith(`_${ALLOWED_CATEGORY}`) && !id.includes(`_${ALLOWED_CATEGORY}_a`)) continue; // not ours
    await db.collection(INDEX_COLLECTION).doc(id).delete();
    console.log(`  deleted stale ${id}`);
    deleted++;
  }

  console.log(`\n[Rebuild] Done: ${written.size} index docs written, ${deleted} stale deleted, in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  if (warned > 0) console.warn(`[Rebuild] ${warned} doc(s) exceed ${INDEX_DOC_SIZE_WARN / 1000}KB - lower INDEX_SHARD_MAX_ITEMS.`);
  process.exit(0);
}

main().catch(e => {
  console.error('[Rebuild] Failed:', e);
  process.exit(1);
});
