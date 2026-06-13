import Link from 'next/link';
import Image from 'next/image';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS, LANG_CONFIG } from '@/lib/i18n';
import { DERMA_SPECIALTIES } from '@/lib/specialties';
import type { SupportedLang } from '@/lib/types';
import type { Metadata } from 'next';
import { getArticles } from '@/lib/articles';
import { getAllBlogPosts, getBlogContent, BLOG_AUTHOR } from '@/lib/blog';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const l = (SUPPORTED_LANGUAGES.includes(lang as SupportedLang) ? lang : 'ko') as SupportedLang;
  const t = UI_TRANSLATIONS[l];
  const config = LANG_CONFIG[l];
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medicalkoreaguide.com';
  const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const canonicalUrl = `${baseUrl}/${lang}`;
  const ogImage = `${baseUrl}/og/og-derma.png`;

  return {
    title: `${t.siteName} — ${t.siteTagline}`,
    description: t.siteDescription,
    openGraph: {
      title: `${t.siteName} — ${t.siteTagline}`,
      description: t.siteDescription,
      locale: config.htmlLang,
      type: 'website',
      siteName: 'Korea Beauty Guide',
      url: canonicalUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: t.siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t.siteName} — ${t.siteTagline}`,
      description: t.siteDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        SUPPORTED_LANGUAGES.map(sl => [LANG_CONFIG[sl].htmlLang, `${baseUrl}/${sl}`])
      ),
    },
  };
}

export const revalidate = 21600;


export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = (SUPPORTED_LANGUAGES.includes(lang as SupportedLang) ? lang : 'ko') as SupportedLang;
  const t = UI_TRANSLATIONS[l];
  const isKo = l === 'ko';

  let dermaArticles: Awaited<ReturnType<typeof getArticles>> = [];
  try {
    dermaArticles = await getArticles(l, 'dermatology', 6);
  } catch {
    // Firestore may not be initialized yet
  }

  const blogPosts = getAllBlogPosts().slice(0, 3);

  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medicalkoreaguide.com';
  const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const langConfig = LANG_CONFIG[l];

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Korea Beauty Guide',
    url: baseUrl,
    logo: { '@type': 'ImageObject', url: `${baseUrl}/img/shape-16.png` },
    description: t.siteDescription,
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Korea Beauty Guide',
    url: baseUrl,
    inLanguage: langConfig.htmlLang,
    description: t.siteDescription,
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />

      {/* Hero — centered, editorial style */}
      <section className="relative bg-gradient-to-b from-rose-950 via-pink-950 to-rose-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-10 left-10 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-8 text-sm font-medium text-pink-200 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            {t.trustBadge}
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05] tracking-tight">
            {isKo ? (
              <>
                <span className="text-pink-200">K-Beauty</span> 클리닉,{'\n'}
                <br className="hidden md:block" />
                데이터로 비교하세요
              </>
            ) : (
              <>
                Compare <span className="text-pink-200">K-Beauty</span>{'\n'}
                <br className="hidden md:block" />
                Clinics with Data
              </>
            )}
          </h1>
          <p className="text-lg md:text-xl text-pink-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.siteDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/${l}/dermatology`}
              className="inline-flex items-center justify-center bg-white text-rose-900 px-8 py-4 rounded-2xl font-semibold text-base hover:bg-pink-50 transition-all hover:scale-[1.02]"
            >
              {isKo ? '클리닉 찾아보기' : 'Browse Clinics'}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
            <Link
              href={`/${l}/dermatology/pricing`}
              className="inline-flex items-center justify-center bg-white/10 text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-white/20 transition-all border border-white/10"
            >
              {isKo ? '시술 가격 가이드' : 'Price Guide'}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats counter bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <StatItem value="5,600+" label={isKo ? '분석 키워드' : 'Keywords Analyzed'} />
            <StatItem value="13" label={isKo ? '지원 언어' : 'Languages'} />
            <StatItem value="475" label={isKo ? '지역 커버리지' : 'Regions Covered'} />
            <StatItem value="3" label={isKo ? '데이터 소스' : 'Data Sources'} />
          </div>
        </div>
      </section>

      {/* Treatment Categories */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {isKo ? '시술별 클리닉 비교' : 'Compare Clinics by Treatment'}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              {isKo
                ? '관심 있는 시술을 선택하면 해당 분야 전문 클리닉을 지역별로 비교할 수 있습니다.'
                : 'Select a treatment to compare specialized clinics by region.'}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {DERMA_SPECIALTIES.map(tr => (
              <Link
                key={tr.slug}
                href={`/${l}/dermatology?s=${tr.slug}`}
                className="group bg-white rounded-2xl p-4 border border-gray-100 hover:border-rose-300 hover:shadow-md transition-all text-center"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-rose-100 to-pink-50 flex items-center justify-center text-rose-600 text-xs font-bold group-hover:from-rose-200 group-hover:to-pink-100 transition-colors">
                  {tr.icon}
                </div>
                <span className="text-sm font-semibold text-gray-800 group-hover:text-rose-600 transition-colors">
                  {isKo ? tr.ko : tr.en}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — horizontal timeline style */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
            {isKo ? '어떻게 분석하나요?' : 'How We Analyze'}
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            {isKo
              ? '네이버·카카오·구글의 실제 방문자 리뷰와 건강보험심사평가원 공공데이터를 모아, 피부과 전문의 감수를 거쳐 정리합니다.'
              : 'We gather real visitor reviews from Naver, Kakao and Google together with official HIRA health data, then organize it under dermatologist review.'}
          </p>
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-rose-200 via-pink-300 to-rose-200" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <TimelineStep
                num="1"
                title={isKo ? '리뷰 모으기' : 'Gather'}
                desc={isKo ? '네이버 플레이스와 카카오맵의 실제 방문자 리뷰와 평점을 모읍니다.' : 'Collect real visitor reviews and ratings from Naver Place and KakaoMap.'}
              />
              <TimelineStep
                num="2"
                title={isKo ? '교차 확인' : 'Cross-check'}
                desc={isKo ? '세 플랫폼에 흩어진 같은 클리닉의 정보를 한데 모아 대조합니다.' : 'Match the same clinic across all three platforms and compare side by side.'}
              />
              <TimelineStep
                num="3"
                title={isKo ? '전문가 검토' : 'Expert review'}
                desc={isKo ? '리뷰·평점·전문의·시설 정보를 함께 살펴 신뢰도가 낮은 데이터는 걸러냅니다.' : 'Weigh reviews, ratings, specialists and facilities, filtering out low-confidence data.'}
              />
              <TimelineStep
                num="4"
                title={isKo ? '감수 후 정리' : 'Reviewed & published'}
                desc={isKo ? '피부과 전문의 감수를 거쳐 정리한 내용을 여러 언어로 제공합니다.' : 'Publish the dermatologist-reviewed result, available in multiple languages.'}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog — dermatologist-written guides (E-E-A-T) */}
      {blogPosts.length > 0 && (
        <section className="bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-rose-600 text-sm font-semibold mb-1">{isKo ? '전문의 가이드' : 'Expert Guides'}</p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isKo ? '피부과 전문의가 직접 쓴 시술 가이드' : 'Guides Written by a Dermatologist'}
                </h2>
                <p className="text-gray-500 text-sm mt-1.5">
                  {isKo
                    ? `${BLOG_AUTHOR.name} ${BLOG_AUTHOR.role} · ${BLOG_AUTHOR.credentials}`
                    : `${BLOG_AUTHOR.name}, ${BLOG_AUTHOR.roleEn}`}
                </p>
              </div>
              <Link href={`/${l}/blog`} className="text-rose-600 text-sm font-medium hover:underline hidden sm:block">
                {isKo ? '전체 보기' : 'View all'} &rarr;
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {blogPosts.map(p => {
                const bc = getBlogContent(p, l);
                return (
                  <Link
                    key={p.slug}
                    href={`/${l}/blog/${p.slug}`}
                    className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-rose-300 hover:shadow-md transition-all"
                  >
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">{bc.category}</span>
                    <h3 className="text-base font-bold text-gray-900 mt-3 mb-2 leading-snug group-hover:text-rose-600 transition-colors">{bc.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{bc.description}</p>
                  </Link>
                );
              })}
            </div>
            <Link href={`/${l}/blog`} className="mt-6 text-rose-600 text-sm font-medium hover:underline block text-center sm:hidden">
              {isKo ? '전체 보기' : 'View all'} &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* Latest Articles — magazine grid */}
      {dermaArticles.length > 0 && (
        <section className="bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-rose-600 text-sm font-semibold mb-1">{t.latestArticles}</p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isKo ? '최근 발행된 클리닉 가이드' : 'Recently Published Clinic Guides'}
                </h2>
              </div>
              <Link href={`/${l}/dermatology`} className="text-rose-600 text-sm font-medium hover:underline hidden sm:block">
                {t.viewAll} &rarr;
              </Link>
            </div>

            {/* First article large, rest in grid */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {dermaArticles.slice(0, 1).map(article => (
                <Link
                  key={article.id}
                  href={`/${l}/${article.category}/${article.slug}`}
                  className="group md:col-span-2 lg:col-span-2 bg-gradient-to-br from-rose-900 to-pink-900 text-white rounded-2xl p-8 hover:shadow-xl transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
                    <Image src="/img/shape-1.png" alt="" width={200} height={200} className="w-full h-full object-contain" />
                  </div>
                  <div className="relative">
                    <span className="text-pink-200/60 text-xs font-medium">{new Date(article.publishedAt).toLocaleDateString(LANG_CONFIG[l].htmlLang)}</span>
                    <h3 className="text-xl md:text-2xl font-bold mt-2 mb-3 leading-snug group-hover:text-pink-100 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-pink-100/60 text-sm line-clamp-3 mb-6 leading-relaxed max-w-lg">
                      {article.metaDescription}
                    </p>
                    <span className="inline-flex items-center text-sm font-semibold text-pink-200 group-hover:translate-x-1 transition-transform">
                      {t.readMore} <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </Link>
              ))}
              {dermaArticles.slice(1).map(article => (
                <ArticleCard key={article.id} article={article} lang={l} />
              ))}
            </div>

            <Link href={`/${l}/dermatology`} className="mt-6 text-rose-600 text-sm font-medium hover:underline block text-center sm:hidden">
              {t.viewAll} &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* CTA — clean, minimal */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {isKo
              ? '나에게 맞는 클리닉, 지금 찾아보세요'
              : 'Find Your Perfect Clinic Today'}
          </h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            {isKo
              ? '매일 새로운 리뷰 데이터가 업데이트됩니다. 보톡스부터 리프팅까지, 시술별 최고의 클리닉을 비교하세요.'
              : 'New review data updated daily. Compare the best clinics for every treatment, from Botox to lifting.'}
          </p>
          <Link
            href={`/${l}/dermatology`}
            className="inline-flex items-center bg-rose-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-rose-700 transition-all hover:scale-[1.02]"
          >
            {isKo ? '클리닉 비교하기' : 'Compare Clinics'}
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-bold text-rose-600">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function TimelineStep({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="text-center relative">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-rose-200/50 relative z-10">
        {num}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function ArticleCard({ article, lang }: { article: { id: string; slug: string; category: string; title: string; metaDescription: string; publishedAt: string }; lang: SupportedLang }) {
  const t = UI_TRANSLATIONS[lang];
  return (
    <Link
      href={`/${lang}/${article.category}/${article.slug}`}
      className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-rose-200 transition-all"
    >
      <span className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString(LANG_CONFIG[lang].htmlLang)}</span>
      <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 mt-1.5 mb-2 line-clamp-2 transition-colors">
        {article.title}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
        {article.metaDescription}
      </p>
      <span className="text-rose-600 text-sm font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center">
        {t.readMore} <svg className="ml-1 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </span>
    </Link>
  );
}
