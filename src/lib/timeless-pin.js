/**
 * 타임리스피부과의원 마포본원 1순위.
 * 지역 5곳 × 진료 6종만. 전역 키워드 생성(keywords.ts)에는 넣지 않는다.
 * publish-action.js, test-publish.js, scripts/bump-timeless-keywords.js, promoted.ts가 이 파일을 쓴다.
 */

const PLACE_ID = '36399081';

const REGIONS = [
  { name: '아현역', slug: 'ahyeon-station' },
  { name: '마포구', slug: 'mapo' },
  { name: '서대문구', slug: 'seodaemun' },
  { name: '공덕동', slug: 'gongdeok' },
  { name: '서울', slug: 'seoul' },
];

// 지역 안에서 이 순서대로 큐에 올린다.
const SPECIALTIES = [
  { name: '스킨부스터', slug: 'skin-booster', specialty: '스킨부스터' },
  { name: '울쎄라', slug: 'ulthera', specialty: '울쎄라' },
  { name: '써마지', slug: 'thermage', specialty: '써마지' },
  { name: '리프팅', slug: 'lifting', specialty: '리프팅' },
  { name: '', slug: '', specialty: '일반' },
  { name: '피부과전문의', slug: 'dermatologist', specialty: '피부과전문의', bareKeyword: true },
];

const REGION_NAMES = REGIONS.map(r => r.name);
const SPECIALTY_NAMES = SPECIALTIES.map(s => s.specialty);

const ADVANTAGES = `
## 타임리스피부과의원 마포본원 순위 지정 (반드시 1순위)
이 지시는 "가장 평점 높거나 리뷰 많은 곳을 먼저 쓴다"는 규칙보다 우선한다.
- 병원 데이터 1번 타임리스피부과의원 마포본원(타임리스피부과)을 1순위로 쓴다. 평점·리뷰 수가 더 적어도 순서를 바꾸지 않는다.
- 첫 문단에서 이 병원을 가장 먼저, 가장 비중 있게 다룬다.
- 상세 분석의 첫 h3, 비교표의 첫 행도 이 병원이다.
- 주소·전화·진료시간·평점·리뷰·전문의는 위 병원 데이터에 있는 값만 쓴다. 데이터에 없는 사실은 만들지 않는다.
- 이름 표기: 타임리스피부과의원 마포본원
`;

function fallbackHospital() {
  return {
    id: PLACE_ID,
    name: '타임리스피부과의원 마포본원',
    category: 'dermatology',
    address: '서울 서대문구 신촌로33길 16 헤센스마트 더 센트럴 2층',
    phone: '0507-1316-0145',
    businessHours: '',
    specialistsInfo: '피부과 2명',
    facilities: '주차',
    directions: '아현역 1번 출구에서 158m',
    naverReviewCount: 0,
    naverBlogReviewCount: 0,
    naverStarRating: null,
    naverReviews: [],
    kakaoRating: null,
    kakaoReviewCount: 0,
    kakaoReviews: [],
    googleRating: null,
    googleReviewCount: 0,
    imageUrls: [],
    homepage: 'http://www.tlskin.com/',
    blogUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    facebookUrl: '',
  };
}

function isTimelessKeyword(kw) {
  return !!kw
    && kw.category === 'dermatology'
    && REGION_NAMES.includes(kw.region)
    && SPECIALTY_NAMES.includes(kw.specialty);
}

function getTimelessPromotion(kw) {
  if (!isTimelessKeyword(kw)) return null;
  return {
    naverPlaceId: PLACE_ID,
    hospital: fallbackHospital(),
    advantages: ADVANTAGES,
  };
}

function isPromotedMatch(hospital, promoted) {
  if (!hospital || !promoted) return false;
  if (promoted.naverPlaceId && String(hospital.id) === String(promoted.naverPlaceId)) return true;
  const hName = (hospital.name || '').replace(/\s/g, '');
  return hName.includes('타임리스피부과');
}

function pinPromotedFirst(hospitals, promoted) {
  if (!promoted || !Array.isArray(hospitals)) return hospitals;
  const idx = hospitals.findIndex(h => isPromotedMatch(h, promoted));
  if (idx > 0) {
    const [h] = hospitals.splice(idx, 1);
    hospitals.unshift(h);
  }
  return hospitals;
}

function moveOrInsertFallback(hospitals, promoted) {
  const list = Array.isArray(hospitals) ? hospitals : [];
  const idx = list.findIndex(h => isPromotedMatch(h, promoted));
  if (idx >= 0) {
    const [existing] = list.splice(idx, 1);
    list.unshift(existing);
    return list;
  }
  list.unshift(promoted.hospital);
  if (list.length > 5) list.pop();
  return list;
}

async function scrapePromotedFirst(browser, hospitals, promoted, deps) {
  const idx = hospitals.findIndex(h => isPromotedMatch(h, promoted));
  if (idx >= 0) {
    const [existing] = hospitals.splice(idx, 1);
    hospitals.unshift(existing);
    console.log(`  [Promoted] ${promoted.hospital.name} found in scraped results → moved to #1`);
    return promoted.advantages;
  }
  if (!promoted.naverPlaceId) {
    hospitals.unshift(promoted.hospital);
    if (hospitals.length > 5) hospitals.pop();
    return promoted.advantages;
  }
  console.log(`  [Promoted] Scraping ${promoted.hospital.name} from Naver Place ID: ${promoted.naverPlaceId}...`);
  try {
    const { detail, reviews } = await deps.getPlaceInfo(browser, promoted.naverPlaceId);
    const hospitalName = detail.name || promoted.hospital.name;
    const [kakaoResult, googleResult] = await Promise.allSettled([
      deps.searchKakao(browser, hospitalName).then(results => (results && results.length > 0 ? results[0] : null)),
      deps.searchGoogle(browser, hospitalName, ''),
    ]);
    const kakaoMatch = kakaoResult.status === 'fulfilled' ? kakaoResult.value : null;
    const googleData = googleResult.status === 'fulfilled' ? googleResult.value : { rating: null, reviewCount: 0 };
    hospitals.unshift({
      id: promoted.naverPlaceId,
      name: hospitalName,
      category: detail.category || promoted.hospital.category,
      address: detail.address || promoted.hospital.address,
      phone: detail.phone || promoted.hospital.phone,
      businessHours: detail.businessHours || promoted.hospital.businessHours,
      specialistsInfo: detail.specialistsInfo || promoted.hospital.specialistsInfo,
      facilities: detail.facilities || promoted.hospital.facilities,
      directions: detail.directions || promoted.hospital.directions,
      naverReviewCount: detail.naverReviewCount || 0,
      naverBlogReviewCount: detail.naverBlogReviewCount || 0,
      naverStarRating: detail.naverStarRating || null,
      naverReviews: reviews,
      kakaoRating: kakaoMatch?.rating || null,
      kakaoReviewCount: kakaoMatch?.reviewCount || 0,
      kakaoReviews: [],
      googleRating: googleData?.rating || null,
      googleReviewCount: googleData?.reviewCount || 0,
      imageUrls: detail.imageUrls || [],
      homepage: detail.homepage || promoted.hospital.homepage,
      blogUrl: detail.blogUrl || '',
      instagramUrl: detail.instagramUrl || '',
      youtubeUrl: detail.youtubeUrl || '',
      facebookUrl: detail.facebookUrl || '',
    });
    if (hospitals.length > 5) hospitals.pop();
    console.log(`  [Promoted] Scraped: ${hospitalName}`);
  } catch (e) {
    console.log(`  [Promoted] Scrape failed, using fallback data: ${e.message}`);
    hospitals.unshift(promoted.hospital);
    if (hospitals.length > 5) hospitals.pop();
  }
  return promoted.advantages;
}

function keywordText(region, spec) {
  if (spec.bareKeyword) return `${region.name} ${spec.name}`;
  if (!spec.name) return `${region.name} 피부과`;
  return `${region.name} ${spec.name} 피부과`;
}

function buildTimelessKeywords() {
  const entries = [];
  for (const region of REGIONS) {
    for (const spec of SPECIALTIES) {
      const slug = spec.slug ? `${region.slug}-${spec.slug}` : region.slug;
      entries.push({
        id: `derma-${slug}`,
        keyword: keywordText(region, spec),
        region: region.name,
        regionSlug: region.slug,
        specialty: spec.specialty,
        specialtySlug: spec.slug || 'general',
        category: 'dermatology',
      });
    }
  }
  return entries;
}

module.exports = {
  PLACE_ID,
  REGIONS,
  SPECIALTIES,
  ADVANTAGES,
  isTimelessKeyword,
  getTimelessPromotion,
  isPromotedMatch,
  pinPromotedFirst,
  moveOrInsertFallback,
  scrapePromotedFirst,
  buildTimelessKeywords,
};
