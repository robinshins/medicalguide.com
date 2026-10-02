/**
 * 타임리스피부과 키워드 30개를 발행 큐 맨 앞에 둔다.
 * 없는 문서는 pending으로 만들고, published/failed는 pending으로 되돌려 재발행되게 한다.
 *
 *   node scripts/bump-timeless-keywords.js           # 조회만
 *   node scripts/bump-timeless-keywords.js --apply   # 반영
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { buildTimelessKeywords } = require('../src/lib/timeless-pin');

const SA_PATH = path.join(__dirname, '..', 'medicalkorea-2205a-firebase-adminsdk-fbsvc-70fd6e21f4.json');
if (!fs.existsSync(SA_PATH)) {
  console.error(`Service account file not found at ${SA_PATH}`);
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))) });
const db = admin.firestore();

const APPLY = process.argv.includes('--apply');

async function main() {
  const keywords = buildTimelessKeywords();
  const orderSnap = await db.collection('keywords_beauty').select('order').get();
  let minOrder = 0;
  orderSnap.docs.forEach(d => {
    const o = d.data().order;
    if (typeof o === 'number' && o < minOrder) minOrder = o;
  });
  const start = minOrder - keywords.length;

  const counts = { create: 0, requeue: 0, reorderPending: 0, skipInProgress: 0 };
  const batch = db.batch();
  let writes = 0;

  for (let i = 0; i < keywords.length; i++) {
    const kw = keywords[i];
    const order = start + i;
    const ref = db.collection('keywords_beauty').doc(kw.id);
    const doc = await ref.get();

    if (!doc.exists) {
      counts.create++;
      console.log(`CREATE  order=${order}  ${kw.keyword}  (${kw.id})`);
      if (APPLY) {
        batch.set(ref, { ...kw, status: 'pending', publishedAt: null, order });
        writes++;
      }
      continue;
    }

    const data = doc.data();
    if (data.status === 'in_progress') {
      counts.skipInProgress++;
      console.log(`SKIP    in_progress  ${kw.keyword}  (${kw.id})`);
      continue;
    }

    const nextStatus = (data.status === 'published' || data.status === 'failed') ? 'pending' : data.status;
    if (data.status === 'published' || data.status === 'failed') counts.requeue++;
    else counts.reorderPending++;
    console.log(`UPDATE  ${data.status} → ${nextStatus}  order ${data.order} → ${order}  ${kw.keyword}`);
    if (APPLY) {
      batch.update(ref, {
        order,
        status: nextStatus,
        publishedAt: nextStatus === 'pending' ? null : data.publishedAt ?? null,
      });
      writes++;
    }
  }

  if (APPLY && writes > 0) await batch.commit();

  console.log('');
  console.log(APPLY ? '반영함' : '조회만 (반영하려면 --apply)');
  console.log(`새로 만듦 ${counts.create} · 재발행으로 되돌림 ${counts.requeue} · 대기 중 순서만 변경 ${counts.reorderPending} · 발행 중이라 건너뜀 ${counts.skipInProgress}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
