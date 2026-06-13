import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from '@/lib/i18n';
import type { SupportedLang } from '@/lib/types';
import { getBlogPost, getAllBlogSlugs, getAllBlogPosts, getBlogContent, BLOG_AUTHOR } from '@/lib/blog';

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return SUPPORTED_LANGUAGES.flatMap(lang => slugs.map(slug => ({ lang, slug })));
}

function baseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medicalkoreaguide.com';
  return raw.startsWith('http') ? raw : `https://${raw}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const l = (SUPPORTED_LANGUAGES.includes(lang as SupportedLang) ? lang : 'ko') as SupportedLang;
  const postp = getBlogPost(slug);
  if (!postp) return { title: 'Not found' };
  const c = getBlogContent(postp, l);
  const canonical = `${baseUrl()}/${l}/blog/${slug}`;

  return {
    title: c.title,
    description: c.description,
    robots: { index: true, follow: true },
    authors: [{ name: BLOG_AUTHOR.name }],
    alternates: {
      canonical,
      languages: Object.fromEntries(SUPPORTED_LANGUAGES.map(sl => [sl, `${baseUrl()}/${sl}/blog/${slug}`])),
    },
    openGraph: {
      title: `${c.title} | Korea Beauty Guide`,
      description: c.description,
      type: 'article',
      url: canonical,
      publishedTime: postp.date,
      authors: [BLOG_AUTHOR.name],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { lang, slug } = await params;
  const l = (SUPPORTED_LANGUAGES.includes(lang as SupportedLang) ? lang : 'ko') as SupportedLang;
  const t = UI_TRANSLATIONS[l];
  const isKo = l === 'ko';
  const postp = getBlogPost(slug);
  if (!postp) notFound();

  const c = getBlogContent(postp, l);
  const role = isKo ? BLOG_AUTHOR.role : BLOG_AUTHOR.roleEn;
  const credentials = isKo ? BLOG_AUTHOR.credentials : BLOG_AUTHOR.credentialsEn;
  const bio = isKo ? BLOG_AUTHOR.bio : BLOG_AUTHOR.bioEn;
  const related = getAllBlogPosts().filter(p => p.slug !== slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline: c.title,
    description: c.description,
    datePublished: postp.date,
    dateModified: postp.date,
    inLanguage: l,
    author: { '@type': 'Person', name: BLOG_AUTHOR.name, jobTitle: role, description: credentials },
    reviewedBy: { '@type': 'Person', name: BLOG_AUTHOR.name, jobTitle: role },
    publisher: { '@type': 'Organization', name: 'Korea Beauty Guide', url: baseUrl() },
    url: `${baseUrl()}/${l}/blog/${slug}`,
  };

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-8">
          <nav className="text-sm text-gray-400 mb-5 flex items-center gap-2 flex-wrap">
            <Link href={`/${l}`} className="hover:text-rose-600 transition-colors">{t.backToHome}</Link>
            <span className="text-gray-300">&rsaquo;</span>
            <Link href={`/${l}/blog`} className="hover:text-rose-600 transition-colors">{isKo ? '블로그' : 'Blog'}</Link>
            <span className="text-gray-300">&rsaquo;</span>
            <span className="text-gray-600">{c.category}</span>
          </nav>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">{c.category}</span>
            <time dateTime={postp.date} className="text-xs text-gray-400">{postp.date}</time>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-gray-900">{c.title}</h1>

          {/* Author byline (E-E-A-T) */}
          <div className="mt-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {BLOG_AUTHOR.name.slice(0, 1)}
            </div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">
                {BLOG_AUTHOR.name} <span className="font-normal text-gray-500">· {role}</span>
              </div>
              <div className="text-xs text-gray-400">{credentials}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <article className="article-content" dangerouslySetInnerHTML={{ __html: c.html }} />

        {/* Author bio card */}
        <div className="mt-12 bg-rose-50/60 border border-rose-100 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-400 flex items-center justify-center text-white font-bold shrink-0">
              {BLOG_AUTHOR.name.slice(0, 1)}
            </div>
            <div>
              <div className="font-bold text-gray-900">{BLOG_AUTHOR.name} · {role}</div>
              <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{bio}</p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{isKo ? '함께 읽으면 좋은 글' : 'Related posts'}</h2>
            <div className="grid gap-3">
              {related.map(r => {
                const rc = getBlogContent(r, l);
                return (
                  <Link key={r.slug} href={`/${l}/blog/${r.slug}`} className="block border border-gray-200 rounded-xl p-4 hover:border-rose-200 hover:shadow-sm transition-all">
                    <span className="text-xs font-semibold text-rose-600">{rc.category}</span>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5">{rc.title}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href={`/${l}/blog`} className="text-sm text-rose-600 hover:text-rose-700 font-medium">
            ← {isKo ? '블로그 목록으로' : 'Back to blog'}
          </Link>
        </div>
      </div>
    </div>
  );
}
