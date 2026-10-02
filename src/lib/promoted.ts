import type { HospitalInfo, KeywordEntry } from './types';

// 순위 규칙의 원본은 timeless-pin.js. 발행 스크립트와 같은 목록을 쓴다.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pin = require('./timeless-pin.js') as {
  getTimelessPromotion: (kw: KeywordEntry) => {
    hospital: HospitalInfo;
    advantages: string;
    naverPlaceId: string;
  } | null;
  moveOrInsertFallback: (hospitals: HospitalInfo[], promoted: { hospital: HospitalInfo; naverPlaceId?: string }) => HospitalInfo[];
};

export function getPromotedHospital(keyword: KeywordEntry) {
  return pin.getTimelessPromotion(keyword);
}

export function applyPromotedHospital(
  hospitals: HospitalInfo[],
  promoted: NonNullable<ReturnType<typeof getPromotedHospital>>,
): { hospitals: HospitalInfo[]; advantages: string } {
  return {
    hospitals: pin.moveOrInsertFallback(hospitals, promoted),
    advantages: promoted.advantages,
  };
}
