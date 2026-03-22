import type { Metadata } from 'next';
import { SUPPORTED_LANGUAGES, LANG_CONFIG, UI_TRANSLATIONS } from '@/lib/i18n';
import type { SupportedLang } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { GoogleAnalytics } from '@next/third-parties/google';

export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map(lang => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l = (SUPPORTED_LANGUAGES.includes(lang as SupportedLang) ? lang : 'ko') as SupportedLang;
  const t = UI_TRANSLATIONS[l];
  const config = LANG_CONFIG[l];

  return {
    title: {
      default: `${t.siteName} — ${t.siteTagline}`,
      template: `%s | ${t.siteName}`,
    },
    description: t.siteDescription,
    icons: {
      icon: '/img/shape-16.png',
      apple: '/img/shape-16.png',
    },
    openGraph: {
      title: `${t.siteName} — ${t.siteTagline}`,
      description: t.siteDescription,
      locale: config.htmlLang,
      type: 'website',
    },
    alternates: {
      languages: Object.fromEntries(
        SUPPORTED_LANGUAGES.map(sl => [LANG_CONFIG[sl].htmlLang, `/${sl}`])
      ),
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = (SUPPORTED_LANGUAGES.includes(lang as SupportedLang) ? lang : 'ko') as SupportedLang;
  const t = UI_TRANSLATIONS[l];
  const config = LANG_CONFIG[l];
  const isKo = l === 'ko';

  return (
    <html lang={config.htmlLang} dir={config.direction} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <GoogleAnalytics gaId="G-TY11HDD292" />
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100/80 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href={`/${l}`} className="flex items-center gap-2">
              <Image src="/img/shape-16.png" alt="Korea Beauty Guide" width={28} height={28} className="rounded-md" />
              <span className="text-base font-bold text-gray-900 tracking-tight">{t.siteName}</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href={`/${l}/dermatology`} className="text-gray-500 hover:text-rose-600 font-medium transition-colors">
                {t.dermatology}
              </Link>
              <Link href={`/${l}/dermatology/pricing`} className="text-gray-400 hover:text-rose-600 font-medium transition-colors hidden sm:block">
                {isKo ? '가격' : 'Prices'}
              </Link>
              <div className="relative group">
                <button className="text-gray-400 hover:text-gray-600 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 transition-colors">
                  {config.nativeName}
                </button>
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 hidden group-hover:block z-50 min-w-[140px]">
                  {SUPPORTED_LANGUAGES.map(sl => (
                    <Link
                      key={sl}
                      href={`/${sl}`}
                      className={`block px-3 py-1.5 text-xs transition-colors ${
                        sl === l ? 'text-rose-600 bg-rose-50 font-medium' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {LANG_CONFIG[sl].nativeName}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer — two-row minimal */}
        <footer className="bg-gray-950 text-gray-400">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
              <div className="max-w-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Image src="/img/shape-16.png" alt="" width={20} height={20} className="rounded" />
                  <span className="text-sm font-bold text-white">{t.siteName}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{t.siteDescription}</p>
              </div>
              <div className="flex gap-10 text-xs">
                <div>
                  <h4 className="text-gray-300 font-semibold uppercase tracking-wider mb-2">{isKo ? '카테고리' : 'Categories'}</h4>
                  <ul className="space-y-1.5">
                    <li><Link href={`/${l}/dermatology`} className="hover:text-white transition-colors">{t.dermatology}</Link></li>
                    <li><Link href={`/${l}/dermatology/pricing`} className="hover:text-white transition-colors">{isKo ? '시술 가격' : 'Prices'}</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-gray-300 font-semibold uppercase tracking-wider mb-2">{isKo ? '데이터' : 'Data'}</h4>
                  <ul className="space-y-1.5 text-gray-500">
                    <li>Naver Place</li>
                    <li>KakaoMap</li>
                    <li>Google Maps</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600">
              <span>&copy; {new Date().getFullYear()} Korea Beauty Guide</span>
              <span>{isKo ? '공공 리뷰 및 공식 의료 데이터 기반' : 'Based on public reviews and official health data'}</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
