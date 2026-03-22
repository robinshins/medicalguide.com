import Link from 'next/link';
import { getArticles } from '@/lib/articles';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS, LANG_CONFIG } from '@/lib/i18n';
import type { SupportedLang } from '@/lib/types';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ lang: string; category: string }>;
}

export async function generateStaticParams() {
  const params: { lang: string; category: string }[] = [];
  for (const lang of SUPPORTED_LANGUAGES) {
    params.push({ lang, category: 'dermatology' });
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const l = (SUPPORTED_LANGUAGES.includes(lang as SupportedLang) ? lang : 'ko') as SupportedLang;
  const t = UI_TRANSLATIONS[l];

  return {
    title: `${t.dermatology} - ${t.siteName}`,
    description: t.siteDescription,
  };
}

export const revalidate = 1800;

export default async function CategoryPage({ params }: PageProps) {
  const { lang, category } = await params;
  const l = (SUPPORTED_LANGUAGES.includes(lang as SupportedLang) ? lang : 'ko') as SupportedLang;
  const t = UI_TRANSLATIONS[l];
  const isKo = l === 'ko';

  let articles: Awaited<ReturnType<typeof getArticles>> = [];
  try {
    articles = await getArticles(lang, category, 50);
  } catch {
    // Firestore may not have data yet
  }

  return (
    <div>
      {/* Header banner */}
      <section className="bg-gradient-to-r from-rose-950 to-pink-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <nav className="text-sm text-pink-200/60 mb-4">
            <Link href={`/${l}`} className="hover:text-white transition-colors">{t.backToHome}</Link>
            <span className="mx-2 text-pink-300/30">&rsaquo;</span>
            <span className="text-white">{t.dermatology}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{t.dermatology}</h1>
          <p className="text-pink-100/60 max-w-2xl">
            {isKo
              ? '보톡스, 필러, 리프팅, 레이저 등 시술별 전문 클리닉을 지역별로 비교합니다.'
              : 'Compare specialized clinics by treatment — Botox, fillers, lifting, laser, and more — across all regions.'}
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="bg-white border-b border-gray-100 sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {isKo ? `${articles.length}개 가이드` : `${articles.length} guides`}
          </p>
          <Link
            href={`/${l}/dermatology/pricing`}
            className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors"
          >
            {isKo ? '시술 가격 보기' : 'View Prices'}
          </Link>
        </div>
      </section>

      {/* Article grid */}
      <section className="bg-gray-50 min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <p className="text-gray-500 text-lg">
                {isKo ? '아직 발행된 글이 없습니다.' : 'No articles published yet.'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {isKo ? '곧 업데이트됩니다.' : 'Coming soon.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, i) => (
                <Link
                  key={article.id}
                  href={`/${l}/${category}/${article.slug}`}
                  className={`group bg-white rounded-2xl border border-gray-100 hover:border-rose-200 hover:shadow-lg transition-all overflow-hidden ${
                    i === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString(LANG_CONFIG[l].htmlLang)}</span>
                    </div>
                    <h2 className="font-bold text-gray-900 group-hover:text-rose-600 mb-2 line-clamp-2 transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {article.metaDescription}
                    </p>
                  </div>
                  <div className="px-6 pb-5">
                    <span className="text-rose-600 text-sm font-medium inline-flex items-center group-hover:translate-x-0.5 transition-transform">
                      {t.readMore} <svg className="ml-1 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
