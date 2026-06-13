import Link from 'next/link';
import type { Metadata } from 'next';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from '@/lib/i18n';
import type { SupportedLang } from '@/lib/types';
import { getAllBlogPosts, BLOG_AUTHOR } from '@/lib/blog';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map(lang => ({ lang }));
}

function baseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medicalkoreaguide.com';
  return raw.startsWith('http') ? raw : `https://${raw}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const l = (SUPPORTED_LANGUAGES.includes(lang as SupportedLang) ? lang : 'ko') as SupportedLang;
  const isKo = l === 'ko';
  const title = isKo ? '피부 시술 블로그' : 'Skin Treatment Blog';
  const description = isKo
    ? '피부과 전문의가 직접 쓰고 검수한 미용 피부 시술 가이드. 보톡스·필러·레이저·리프팅부터 비용과 안전까지.'
    : 'Aesthetic dermatology guides written and reviewed by a board-certified dermatologist — botox, filler, laser, lifting, pricing and safety.';
  const canonical = `${baseUrl()}/${l}/blog`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: Object.fromEntries(SUPPORTED_LANGUAGES.map(sl => [sl, `${baseUrl()}/${sl}/blog`])),
    },
    openGraph: { title: `${title} | Korea Beauty Guide`, description, type: 'website', url: canonical },
  };
}

export default async function BlogIndexPage({ params }: PageProps) {
  const { lang } = await params;
  const l = (SUPPORTED_LANGUAGES.includes(lang as SupportedLang) ? lang : 'ko') as SupportedLang;
  const t = UI_TRANSLATIONS[l];
  const isKo = l === 'ko';
  const posts = getAllBlogPosts();

  return (
    <div className="bg-white">
      <div className="bg-gradient-to-b from-rose-950 via-pink-950 to-rose-900 text-white">
        <div className="max-w-3xl mx-auto px-4 pt-12 pb-10">
          <nav className="text-sm text-rose-200/80 mb-5 flex items-center gap-2">
            <Link href={`/${l}`} className="hover:text-white transition-colors">{t.backToHome}</Link>
            <span className="text-rose-300/50">&rsaquo;</span>
            <span className="text-white/90">{isKo ? '블로그' : 'Blog'}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {isKo ? '피부 시술 블로그' : 'Skin Treatment Blog'}
          </h1>
          <p className="text-rose-100/80 text-sm leading-relaxed max-w-xl">
            {isKo
              ? '피부과 전문의가 직접 작성하고 검수한 미용 피부 시술 가이드입니다. 광고가 아닌, 알아두면 도움이 되는 정보만 담았습니다.'
              : 'Aesthetic skin treatment guides written and reviewed by a board-certified dermatologist — practical information, not advertising.'}
          </p>
          <p className="mt-4 text-xs text-rose-200/70">
            {isKo ? '검수·작성' : 'Written & reviewed by'} · {BLOG_AUTHOR.name} ({BLOG_AUTHOR.role})
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="grid gap-4">
          {posts.map(p => (
            <Link
              key={p.slug}
              href={`/${l}/blog/${p.slug}`}
              className="block bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-rose-200 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">{p.category}</span>
                <time dateTime={p.date} className="text-xs text-gray-400">{p.date}</time>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1.5 tracking-tight">{p.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{p.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
