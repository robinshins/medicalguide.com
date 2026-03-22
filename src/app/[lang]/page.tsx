import Link from 'next/link';
import Image from 'next/image';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS, LANG_CONFIG } from '@/lib/i18n';
import type { SupportedLang } from '@/lib/types';
import { getArticles } from '@/lib/articles';

export const revalidate = 1800;

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = (SUPPORTED_LANGUAGES.includes(lang as SupportedLang) ? lang : 'ko') as SupportedLang;
  const t = UI_TRANSLATIONS[l];

  let dermaArticles: Awaited<ReturnType<typeof getArticles>> = [];
  try {
    dermaArticles = await getArticles(l, 'dermatology', 9);
  } catch {
    // Firestore may not be initialized yet
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-950 via-pink-950 to-fuchsia-950 text-white overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute -top-20 -right-20 w-64 h-64 opacity-20">
          <Image src="/img/shape-1.png" alt="" width={400} height={400} className="w-full h-full object-contain" />
        </div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 opacity-15">
          <Image src="/img/shape-5.png" alt="" width={400} height={400} className="w-full h-full object-contain" />
        </div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 opacity-10">
          <Image src="/img/shape-3.png" alt="" width={400} height={400} className="w-full h-full object-contain" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-pink-200 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
              {t.trustBadge}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-[1.1] tracking-tight">
              {t.siteTagline}
            </h1>
            <p className="text-lg text-pink-100/80 max-w-xl mb-10 leading-relaxed">
              {t.siteDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/${l}/dermatology`}
                className="inline-flex items-center justify-center bg-white text-rose-900 px-7 py-3.5 rounded-xl font-semibold text-base hover:bg-pink-50 transition-colors"
              >
                {t.dermatology}
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {l === 'ko' ? '실제 리뷰 데이터로 비교하는 뷰티 클리닉' : 'Compare Beauty Clinics with Real Review Data'}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {l === 'ko'
                ? '네이버, 카카오, 구글의 실제 방문자 리뷰와 평점 데이터를 수집하고 분석하여 가장 신뢰할 수 있는 클리닉 정보를 제공합니다.'
                : 'We collect and analyze real visitor reviews and ratings from Naver, Kakao, and Google to provide the most reliable clinic information.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TrustCard
              image="/img/shape-4.png"
              title={l === 'ko' ? '실제 방문자 리뷰 분석' : 'Real Visitor Review Analysis'}
              description={l === 'ko'
                ? '네이버 플레이스와 카카오맵의 실제 방문자 리뷰를 수집하고 분석하여 가장 신뢰할 수 있는 클리닉 정보를 제공합니다.'
                : 'We collect and analyze real visitor reviews from Naver Place and KakaoMap to provide the most reliable clinic information.'}
            />
            <TrustCard
              image="/img/shape-6.png"
              title={l === 'ko' ? '시술별 전문 클리닉 비교' : 'Treatment-Specific Clinic Comparison'}
              description={l === 'ko'
                ? '보톡스, 필러, 리프팅, 레이저 등 시술별로 전문 클리닉을 비교하여 최적의 선택을 도와드립니다.'
                : 'Compare specialized clinics by treatment type — Botox, fillers, lifting, laser, and more — to help you make the best choice.'}
            />
            <TrustCard
              image="/img/shape-7.png"
              title={l === 'ko' ? '종합 평점 및 접근성 분석' : 'Comprehensive Rating & Access Analysis'}
              description={l === 'ko'
                ? '리뷰, 평점, 전문의 정보, 시설, 접근성을 종합적으로 분석하여 최적의 클리닉을 추천합니다.'
                : 'We comprehensively analyze reviews, ratings, specialist info, facilities, and accessibility to recommend the best clinics.'}
            />
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-rose-50/50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            {l === 'ko' ? '클리닉 선정 프로세스' : 'Our Clinic Selection Process'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <StepCard
              step="01"
              title={l === 'ko' ? '리뷰 데이터 수집' : 'Review Data Collection'}
              description={l === 'ko'
                ? '네이버 플레이스, 카카오맵에서 실제 방문자 리뷰와 평점을 수집합니다.'
                : 'Collect real visitor reviews and ratings from Naver Place and KakaoMap.'}
            />
            <StepCard
              step="02"
              title={l === 'ko' ? '전문의 정보 확인' : 'Specialist Verification'}
              description={l === 'ko'
                ? '건강보험심사평가원 데이터로 전문의 수, 진료과목, 시설 정보를 확인합니다.'
                : 'Verify specialist count, departments, and facilities through official HIRA data.'}
            />
            <StepCard
              step="03"
              title={l === 'ko' ? '종합 분석' : 'Comprehensive Analysis'}
              description={l === 'ko'
                ? '수집된 데이터를 종합적으로 분석하여 시술별 최고의 클리닉을 선별합니다.'
                : 'Comprehensively analyze all data to select the best clinics for each treatment.'}
            />
            <StepCard
              step="04"
              title={l === 'ko' ? '상세 비교 리뷰' : 'Detailed Comparison'}
              description={l === 'ko'
                ? '각 클리닉의 장단점, 실제 후기, 실용 정보를 상세하게 정리하여 제공합니다.'
                : 'Provide detailed pros/cons, real reviews, and practical info for each clinic.'}
            />
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      {dermaArticles.length > 0 && (
        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t.dermatology} &mdash; {t.latestArticles}</h2>
              <Link href={`/${l}/dermatology`} className="text-rose-600 text-sm font-medium hover:underline">
                {t.viewAll} &rarr;
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {dermaArticles.map(article => (
                <ArticleCard key={article.id} article={article} lang={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-rose-950 via-pink-950 to-fuchsia-950 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 opacity-15">
          <Image src="/img/shape-2.png" alt="" width={400} height={400} className="w-full h-full object-contain" />
        </div>
        <div className="absolute bottom-0 left-0 w-40 h-40 opacity-10">
          <Image src="/img/shape-8.png" alt="" width={400} height={400} className="w-full h-full object-contain" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {l === 'ko'
              ? '나에게 맞는 뷰티 클리닉을 찾아보세요'
              : 'Find the Perfect Beauty Clinic for You'}
          </h2>
          <p className="text-pink-100/70 mb-8 max-w-xl mx-auto">
            {l === 'ko'
              ? '매일 새로운 클리닉 리뷰가 업데이트됩니다. 네이버, 카카오 실제 리뷰 데이터를 기반으로 한 가장 신뢰할 수 있는 뷰티 클리닉 가이드입니다.'
              : 'New clinic reviews updated daily. The most trustworthy beauty clinic guide based on real Naver & Kakao review data.'}
          </p>
          <Link
            href={`/${l}/dermatology`}
            className="inline-flex items-center bg-white text-rose-900 px-7 py-3.5 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
          >
            {t.dermatology}
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

function TrustCard({ image, title, description }: { image: string; title: string; description: string }) {
  return (
    <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-100 hover:border-rose-200 transition-colors">
      <div className="w-16 h-16 mb-5 relative">
        <Image src={image} alt="" width={64} height={64} className="w-full h-full object-contain" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-rose-100">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-rose-600 text-white text-sm font-bold mb-4">
        {step}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
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
      <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 mb-2 line-clamp-2 transition-colors">
        {article.title}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">
        {article.metaDescription}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{new Date(article.publishedAt).toLocaleDateString(LANG_CONFIG[lang].htmlLang)}</span>
        <span className="text-rose-600 font-medium group-hover:translate-x-0.5 transition-transform">{t.readMore} &rarr;</span>
      </div>
    </Link>
  );
}
