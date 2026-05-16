import LegalPage, { buildLegalMetadata } from '@/app/components/LegalPage';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import type { SupportedLang } from '@/lib/types';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const l = (SUPPORTED_LANGUAGES.includes(lang as SupportedLang) ? lang : 'ko') as SupportedLang;
  return buildLegalMetadata(l, 'privacy');
}

export default async function PrivacyPage({ params }: PageProps) {
  const { lang } = await params;
  const l = (SUPPORTED_LANGUAGES.includes(lang as SupportedLang) ? lang : 'ko') as SupportedLang;
  return <LegalPage lang={l} pageKey="privacy" />;
}
