import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /sitemap.xml은 api/sitemap/route.ts가 요청마다 만든다. app/sitemap.ts(metadata route)는
  // revalidate를 듣지 않아 배포 시점 목록에 멈췄다(2026-11-24, 치과 사이트와 같은 방식으로 바꿈).
  async rewrites() {
    return [{ source: '/sitemap.xml', destination: '/api/sitemap' }];
  },
  // Allow Naver image domains
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.naver.com' },
      { protocol: 'https', hostname: '**.pstatic.net' },
      { protocol: 'https', hostname: '**.kakaocdn.net' },
    ],
  },
  // Ignore build errors for initial deployment
  typescript: {
    ignoreBuildErrors: false,
  },
  // Server external packages for puppeteer
  serverExternalPackages: [
    'puppeteer-core',
    '@sparticuz/chromium',
    'firebase-admin',
    '@anthropic-ai/sdk',
    'openai',
  ],
};

export default nextConfig;
