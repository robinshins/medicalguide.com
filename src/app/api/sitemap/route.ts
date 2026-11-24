import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { loadAllArticleSlugs } from '@/lib/articles';
import { getAllBlogPosts } from '@/lib/blog';

// /sitemap.xml의 실제 구현. next.config.ts의 rewrite가 /sitemap.xml을 여기로 보낸다.
//
// 예전 app/sitemap.ts(metadata route, revalidate = 3600)는 재생성되지 않아 배포 시점의 글 목록이
// 다음 배포까지 그대로 나갔다(2026-11-24 확인: 11/09 배포 이후 매일 발행한 글이 사이트맵에 없었다).
// 요청마다 언어별 인덱스(13회 읽기)를 읽고, CDN이 30분 동안 응답을 들고 있는다.
export const dynamic = 'force-dynamic';

const CACHE_CONTROL = 'public, s-maxage=1800, stale-while-revalidate=86400';

interface Entry {
  url: string;
  lastModified: string;
  changeFrequency: 'daily' | 'weekly' | 'monthly';
  priority: number;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function isoDate(v: string | undefined, fallback: string): string {
  if (!v) return fallback;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? fallback : d.toISOString();
}

export async function GET() {
  const rawUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medicalkoreaguide.com').trim();
  const baseUrl = (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`).replace(/\/+$/, '');
  const now = new Date().toISOString();
  const entries: Entry[] = [];

  for (const lang of SUPPORTED_LANGUAGES) {
    entries.push({ url: `${baseUrl}/${lang}`, lastModified: now, changeFrequency: 'daily', priority: 1.0 });
    entries.push({ url: `${baseUrl}/${lang}/dermatology`, lastModified: now, changeFrequency: 'daily', priority: 0.9 });
    // Pricing pages (dermatology only — dental is out of scope for this site)
    entries.push({ url: `${baseUrl}/${lang}/dermatology/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 });
    // Blog index + posts (human-authored editorial content)
    entries.push({ url: `${baseUrl}/${lang}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 });
    for (const blogPost of getAllBlogPosts()) {
      entries.push({
        url: `${baseUrl}/${lang}/blog/${blogPost.slug}`,
        lastModified: isoDate(blogPost.date, now),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  // 인덱스를 못 읽으면 500을 낸다 — 글 없는 사이트맵을 200으로 내보내 검색엔진이 전체 URL을
  // 잃게 하는 것보다 낫고, CDN은 직전 정상 응답을 계속 쓴다.
  const articles = await loadAllArticleSlugs();
  for (const article of articles) {
    entries.push({
      url: `${baseUrl}/${article.lang}/${article.category}/${article.slug}`,
      lastModified: isoDate(article.publishedAt, now),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  const body = entries
    .map(e =>
      `<url><loc>${escapeXml(e.url)}</loc><lastmod>${e.lastModified}</lastmod><changefreq>${e.changeFrequency}</changefreq><priority>${e.priority.toFixed(1)}</priority></url>`
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': CACHE_CONTROL },
  });
}
