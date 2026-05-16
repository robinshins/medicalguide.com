import Link from 'next/link';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from '@/lib/i18n';
import type { SupportedLang } from '@/lib/types';
import { getLegalDoc } from '@/lib/legal';

type LegalKey = 'about' | 'privacy' | 'terms' | 'contact';

export default function LegalPage({ lang, pageKey }: { lang: SupportedLang; pageKey: LegalKey }) {
  const doc = getLegalDoc(lang, pageKey);
  const t = UI_TRANSLATIONS[lang];
  const isKo = lang === 'ko';

  return (
    <div className="bg-white">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-8">
          <nav className="text-sm text-gray-400 mb-5 flex items-center gap-2">
            <Link href={`/${lang}`} className="hover:text-rose-600 transition-colors">{t.backToHome}</Link>
            <span className="text-gray-300">&rsaquo;</span>
            <span className="text-gray-600">{doc.title}</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 rounded-full bg-gradient-to-b from-rose-500 to-pink-400" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">{doc.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <article className="article-content" dangerouslySetInnerHTML={{ __html: doc.html }} />

        <div className="mt-14 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href={`/${lang}/about`} className="hover:text-rose-600 transition-colors">{isKo ? '소개' : 'About'}</Link>
          <Link href={`/${lang}/privacy`} className="hover:text-rose-600 transition-colors">{isKo ? '개인정보처리방침' : 'Privacy'}</Link>
          <Link href={`/${lang}/terms`} className="hover:text-rose-600 transition-colors">{isKo ? '이용약관' : 'Terms'}</Link>
          <Link href={`/${lang}/contact`} className="hover:text-rose-600 transition-colors">{isKo ? '문의' : 'Contact'}</Link>
        </div>
      </div>
    </div>
  );
}

export function buildLegalMetadata(lang: SupportedLang, pageKey: LegalKey) {
  const doc = getLegalDoc(lang, pageKey);
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medicalkoreaguide.com';
  const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const canonicalUrl = `${baseUrl}/${lang}/${pageKey}`;

  return {
    title: doc.title,
    description: doc.description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        SUPPORTED_LANGUAGES.map(sl => [sl, `${baseUrl}/${sl}/${pageKey}`])
      ),
    },
    openGraph: {
      title: `${doc.title} | Korea Beauty Guide`,
      description: doc.description,
      type: 'website' as const,
      url: canonicalUrl,
    },
  };
}
