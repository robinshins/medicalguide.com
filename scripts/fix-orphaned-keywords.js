/**
 * Recovery: keywords_beauty docs stuck in `failed` / `in_progress` whose Korean article
 * actually exists in `articles` are set back to `published`.
 *
 * Why this happens: publish-action.js saves the 13 article docs first and updates the
 * keyword status last. Anything that throws in between (index upsert over 1MB, runner
 * killed, ...) leaves a published article behind a keyword marked failed/in_progress.
 *
 * Usage:
 *   node scripts/fix-orphaned-keywords.js           # dry run: list what would change
 *   node scripts/fix-orphaned-keywords.js --apply   # write the fixes
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const SA_PATH = path.join(__dirname, '..', 'medicalkorea-2205a-firebase-adminsdk-fbsvc-70fd6e21f4.json');
if (!fs.existsSync(SA_PATH)) {
  console.error(`Service account file not found at ${SA_PATH}`);
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))) });
const db = admin.firestore();

const APPLY = process.argv.includes('--apply');
// An in_progress keyword whose article was saved this recently may belong to a live run
// that has not reached its final status update yet. Leave those alone.
const LIVE_RUN_GRACE_MS = 30 * 60 * 1000;

function slugFor(kw) {
  return kw.specialtySlug === 'general' ? kw.regionSlug : `${kw.regionSlug}-${kw.specialtySlug}`;
}

async function main() {
  const snap = await db.collection('keywords_beauty')
    .where('status', 'in', ['failed', 'in_progress'])
    .get();
  console.log(`[Fix] ${snap.size} keywords in failed/in_progress. Checking for existing articles...`);

  const fixes = [];
  let skippedLive = 0;
  for (const doc of snap.docs) {
    const kw = doc.data();
    const articleId = `${kw.category}-${slugFor(kw)}-ko`;
    const article = await db.collection('articles').doc(articleId).get();
    if (!article.exists) continue;
    const publishedAt = article.data().publishedAt || null;
    if (kw.status === 'in_progress' && publishedAt && Date.now() - Date.parse(publishedAt) < LIVE_RUN_GRACE_MS) {
      skippedLive++;
      continue;
    }
    fixes.push({ id: doc.id, status: kw.status, order: kw.order, publishedAt });
  }

  fixes.sort((a, b) => a.order - b.order);
  for (const f of fixes) {
    console.log(`  ${f.status.padEnd(11)} order=${String(f.order).padStart(5)} ${f.id} -> published (${f.publishedAt})`);
  }
  console.log(`\n[Fix] ${fixes.length} keyword(s) have a published article but the wrong status` +
    (skippedLive ? ` (${skippedLive} in_progress skipped as possibly live)` : ''));

  if (!APPLY) {
    console.log('[Fix] Dry run. Re-run with --apply to write.');
    process.exit(0);
  }

  let batch = db.batch();
  let n = 0;
  for (const f of fixes) {
    batch.update(db.collection('keywords_beauty').doc(f.id), { status: 'published', publishedAt: f.publishedAt });
    if (++n % 400 === 0) { await batch.commit(); batch = db.batch(); }
  }
  if (n % 400 !== 0) await batch.commit();
  console.log(`[Fix] Updated ${n} keyword(s) to published.`);
  process.exit(0);
}

main().catch(e => {
  console.error('[Fix] Failed:', e);
  process.exit(1);
});
