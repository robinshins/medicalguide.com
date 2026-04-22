import Link from 'next/link';
import { Suspense } from 'react';
import { getArticles } from '@/lib/articles';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS, LANG_CONFIG } from '@/lib/i18n';
import type { SupportedLang } from '@/lib/types';
import type { Metadata } from 'next';
import ArticleGrid from '@/app/components/ArticleGrid';

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
  const { lang, category } = await params;
  const l = (SUPPORTED_LANGUAGES.includes(lang as SupportedLang) ? lang : 'ko') as SupportedLang;
  const t = UI_TRANSLATIONS[l];
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medicalkoreaguide.com';
  const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const canonicalUrl = `${baseUrl}/${lang}/${category}`;

  return {
    title: `${t.dermatology} - ${t.siteName}`,
    description: t.siteDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        SUPPORTED_LANGUAGES.map(sl => [LANG_CONFIG[sl].htmlLang, `${baseUrl}/${sl}/${category}`])
      ),
    },
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
    articles = await getArticles(lang, category);
  } catch {
    // Firestore may not have data yet
  }

  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medicalkoreaguide.com';
  const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const langConfig = LANG_CONFIG[l];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, item: { '@id': baseUrl, name: 'Korea Beauty Guide' } },
      { '@type': 'ListItem', position: 2, item: { '@id': `${baseUrl}/${lang}/${category}`, name: t.dermatology } },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t.dermatology,
    url: `${baseUrl}/${lang}/${category}`,
    inLanguage: langConfig.htmlLang,
    description: t.siteDescription,
    isPartOf: { '@type': 'WebSite', name: 'Korea Beauty Guide', url: baseUrl },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

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

      {/* Article grid + specialty filter */}
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
            <Suspense fallback={<div className="h-40" />}>
              <ArticleGrid
                articles={articles.map(a => ({
                  id: a.id,
                  slug: a.slug,
                  title: a.title,
                  metaDescription: a.metaDescription,
                  publishedAt: a.publishedAt,
                  specialty: a.specialty,
                }))}
                lang={l}
                category={category}
                htmlLang={LANG_CONFIG[l].htmlLang}
                readMoreLabel={t.readMore}
                isKo={isKo}
                pricingHref={`/${l}/dermatology/pricing`}
              />
            </Suspense>
          )}
        </div>
      </section>
    </div>
  );
}
