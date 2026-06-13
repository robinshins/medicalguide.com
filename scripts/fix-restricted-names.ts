/**
 * One-off repair: some hospital `name` fields were polluted with Naver's
 * "서비스 이용이 제한되었습니다" rate-limit banner during bulk scrapes.
 *
 * Strategy: recover real names primarily via Naver place SEARCH (one request per
 * polluted keyword returns up to 5 {id,name}) — far fewer / lighter requests than
 * hammering per-place pages. Place-page scraping is only a fallback for ids the
 * search didn't cover.
 *
 *   DRY=1 LIMIT=10 npx tsx scripts/fix-restricted-names.ts   # search probe, no writes
 *   npx tsx scripts/fix-restricted-names.ts                  # full run (writes)
 *   NOFALLBACK=1 npx tsx scripts/fix-restricted-names.ts     # search-only, skip place-page fallback
 *
 * Tunables: GAP (ms between requests), COOLDOWN (ms between fallback passes).
 * Requires .env.local: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */
import * as dotenv from 'dotenv'; dotenv.config({ path: '.env.local' });
import admin from 'firebase-admin';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { looksRestricted } from '../src/lib/restricted';
import { searchNaverPlaces } from '../src/lib/scraper';

const DRY = process.env.DRY === '1';
const LIMIT = parseInt(process.env.LIMIT || '10', 10);
const GAP = parseInt(process.env.GAP || '4000', 10);
const COOLDOWN = parseInt(process.env.COOLDOWN || '45000', 10);
const NOFALLBACK = process.env.NOFALLBACK === '1';
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const jitter = () => GAP + Math.floor(Math.random() * 2000);

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  }),
});
const db = admin.firestore();

const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
function chromePath(): string {
  for (const p of ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'])
    if (fs.existsSync(p)) return p;
  throw new Error('No Chrome/Chromium found');
}

interface Hospital { id?: string; name?: string; [k: string]: unknown }

async function main() {
  console.log(`\n=== fix-restricted-names ${DRY ? '(DRY RUN)' : '(LIVE — writes)'} ===\n`);

  // 1. Lightweight scan — only `hospitals` + `keyword`.
  console.log('Scanning articles...');
  const snap = await db.collection('articles').select('hospitals', 'keyword').get();
  const pollutedRefs: FirebaseFirestore.DocumentReference[] = [];
  const ids = new Set<string>();
  const keywords = new Set<string>();
  snap.forEach(doc => {
    const hospitals = (doc.get('hospitals') || []) as Hospital[];
    if (hospitals.some(h => looksRestricted(h.name))) {
      pollutedRefs.push(doc.ref);
      hospitals.forEach(h => { if (looksRestricted(h.name) && h.id) ids.add(String(h.id)); });
      const kw = doc.get('keyword'); if (kw) keywords.add(String(kw));
    }
  });
  console.log(`Scanned ${snap.size} docs · ${pollutedRefs.length} polluted docs · ${ids.size} placeIds · ${keywords.size} keywords\n`);

  const nameById = new Map<string, string>();

  // 2. Primary recovery: Naver place SEARCH per keyword.
  const kwList = [...keywords];
  const kwTargets = DRY ? kwList.slice(0, LIMIT) : kwList;
  console.log(`Search phase: ${kwTargets.length} keywords\n`);
  for (let i = 0; i < kwTargets.length; i++) {
    const kw = kwTargets[i];
    try {
      const results = await searchNaverPlaces(kw);
      let hit = 0;
      for (const r of results) {
        if (ids.has(String(r.id)) && r.name && !looksRestricted(r.name) && !nameById.has(String(r.id))) {
          nameById.set(String(r.id), r.name); hit++;
        }
      }
      console.log(`[${i + 1}/${kwTargets.length}] "${kw}" -> ${results.length} places, +${hit} recovered (total ${nameById.size}/${ids.size})`);
    } catch (e) {
      console.log(`[${i + 1}/${kwTargets.length}] "${kw}" -> ERR ${e instanceof Error ? e.message : e}`);
    }
    await delay(jitter());
  }

  // 3. Fallback: place-page scrape for ids search didn't cover.
  let missing = [...ids].filter(id => !nameById.has(id));
  if (!DRY && !NOFALLBACK && missing.length) {
    console.log(`\nFallback phase: ${missing.length} ids not found via search\n`);
    const browser = await puppeteer.launch({
      executablePath: chromePath(), headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    try {
      const fetchName = async (id: string): Promise<string | null> => {
        const page = await browser.newPage();
        try {
          await page.setUserAgent(MOBILE_UA);
          await page.setViewport({ width: 390, height: 844, isMobile: true });
          await page.goto(`https://m.place.naver.com/hospital/${id}/home`, { waitUntil: 'networkidle2', timeout: 25000 });
          await delay(800);
          const name = await page.evaluate(() => {
            const lines = document.body.innerText.split('\n').map(l => l.trim()).filter(Boolean);
            for (let i = 0; i < 5; i++) {
              const line = lines[i];
              if (line && line.length > 1 && line.length < 50 && !line.includes('이전') && !line.includes('플레이스') && !line.includes('마이')) return line;
            }
            return '';
          });
          return (!name || looksRestricted(name)) ? null : name;
        } finally { await page.close(); }
      };
      for (let pass = 1; pass <= 3 && missing.length; pass++) {
        if (pass > 1) { console.log(`\n--- fallback pass ${pass}: ${missing.length} left, cooldown ${COOLDOWN / 1000}s ---`); await delay(COOLDOWN); }
        const still: string[] = [];
        for (let i = 0; i < missing.length; i++) {
          const id = missing[i];
          let name: string | null = null;
          try { name = await fetchName(id); } catch { /* */ }
          if (name) { nameById.set(id, name); console.log(`[p${pass} ${i + 1}/${missing.length}] ${id} -> "${name}"`); }
          else { still.push(id); }
          await delay(jitter());
        }
        missing = still;
      }
    } finally { await browser.close(); }
  }

  console.log(`\nRecovered ${nameById.size}/${ids.size} names · ${ids.size - nameById.size} still missing`);

  if (DRY) { console.log('\nDRY RUN — no writes.'); process.exit(0); }
  if (nameById.size === 0) { console.log('\nNothing recovered — aborting (no writes).'); process.exit(1); }

  // 4. Apply: swap polluted names + fix unambiguous content, batched.
  let updatedDocs = 0, updatedNames = 0, contentFixed = 0, batch = db.batch(), ops = 0;
  for (let i = 0; i < pollutedRefs.length; i += 300) {
    const docs = await db.getAll(...pollutedRefs.slice(i, i + 300));
    for (const d of docs) {
      const data = d.data(); if (!data) continue;
      const hospitals = (data.hospitals || []) as Hospital[];
      const recovered: string[] = [];
      let changed = false;
      const newHospitals = hospitals.map(h => {
        if (looksRestricted(h.name) && h.id && nameById.has(String(h.id))) {
          const real = nameById.get(String(h.id))!; recovered.push(real); changed = true; updatedNames++;
          return { ...h, name: real };
        }
        return h;
      });
      const update: Record<string, unknown> = {};
      if (changed) update.hospitals = newHospitals;
      if (typeof data.content === 'string' && looksRestricted(data.content) && recovered.length === 1) {
        update.content = data.content.split('서비스 이용이 제한되었습니다.').join(recovered[0]).split('서비스 이용이 제한되었습니다').join(recovered[0]);
        contentFixed++;
      }
      if (Object.keys(update).length) {
        batch.update(d.ref, update); ops++; updatedDocs++;
        if (ops >= 400) { await batch.commit(); batch = db.batch(); ops = 0; }
      }
    }
  }
  if (ops > 0) await batch.commit();

  console.log(`\nDONE · ${updatedNames} names across ${updatedDocs} docs · ${contentFixed} content bodies fixed`);
  if (missing.length) console.log(`\n${missing.length} placeIds still unrecovered — re-run later:\n${missing.join(', ')}`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
