export interface DermaSpecialty {
  slug: string;
  ko: string;
  en: string;
  icon: string;
}

export const DERMA_SPECIALTIES: DermaSpecialty[] = [
  { slug: 'botox', ko: '보톡스', en: 'Botox', icon: '01' },
  { slug: 'filler', ko: '필러', en: 'Filler', icon: '02' },
  { slug: 'lifting', ko: '리프팅', en: 'Lifting', icon: '03' },
  { slug: 'laser', ko: '레이저', en: 'Laser', icon: '04' },
  { slug: 'acne', ko: '여드름', en: 'Acne', icon: '05' },
  { slug: 'ulthera', ko: '울쎄라', en: 'Ulthera', icon: '06' },
  { slug: 'thermage', ko: '써마지', en: 'Thermage', icon: '07' },
  { slug: 'contouring', ko: '윤곽', en: 'Contouring', icon: '08' },
  { slug: 'hair-removal', ko: '제모', en: 'Hair Removal', icon: '09' },
  { slug: 'wrinkle', ko: '주름관리', en: 'Anti-Wrinkle', icon: '10' },
  { slug: 'scar', ko: '흉터', en: 'Scar', icon: '11' },
  { slug: 'pore', ko: '모공', en: 'Pore Care', icon: '12' },
];

const BY_SLUG: Record<string, DermaSpecialty> = Object.fromEntries(
  DERMA_SPECIALTIES.map(s => [s.slug, s])
);

const BY_KO: Record<string, DermaSpecialty> = Object.fromEntries(
  DERMA_SPECIALTIES.map(s => [s.ko, s])
);

export function getSpecialtyBySlug(slug: string): DermaSpecialty | undefined {
  return BY_SLUG[slug];
}

export function getSpecialtyByKo(ko: string): DermaSpecialty | undefined {
  return BY_KO[ko];
}
