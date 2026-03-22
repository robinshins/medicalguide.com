# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — Start development server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `node test-publish.js` — Publish 1 article locally (scrape + generate + translate + save)

No test framework is configured.

## Architecture

Korea Beauty Guide is an automated multilingual SEO content platform for Korean beauty/aesthetic clinics. It generates clinic review articles by scraping real data, creating AI content, and publishing to Firestore.

**This project shares Firestore DB with the original Medical Korea Guide but operates independently** — publishing here does NOT affect the original project's publishing queue.

### Data Pipeline (server-side, `src/lib/`)

```
keywords.ts (dermatology-only: 475 regions x 13 specialties, ordered by population)
    → scraper.ts (Puppeteer: Naver Place + KakaoMap + Google Maps)
    → matcher.ts (GPT-5.4-mini: cross-platform clinic name/address matching)
    → generator.ts (Claude Sonnet: Korean article → GPT-5.4-mini: 12 language translations)
    → publish.ts (orchestrator: queue management + Firestore save)
```

### Category Focus

- **Dermatology only** (no dental) — beauty/aesthetics clinics
- Specialties: botox, filler, laser, acne, scar, pore, ulthera, thermage, contouring, lifting, wrinkle, hair-removal
- URL category path: `dermatology` (matches Firestore schema)

### Frontend (Next.js 16 App Router)

Routes follow `[lang]/[category]/[slug]` pattern supporting 13 languages. Article content is server-generated HTML rendered via `dangerouslySetInnerHTML` with styles in `.article-content` (globals.css).

**Design theme**: Pink/rose beauty aesthetic (rose-950 gradients, rose-600 accents, pink highlights)

### Key Conventions

- **Next.js 16 breaking change**: `params` is a `Promise` — always `await params` before accessing properties
- **Import alias**: `@/*` maps to `src/*`
- **Server-only libs**: Everything in `src/lib/` must never be imported from client components
- **Dynamic imports**: Puppeteer (`scraper.ts`) and Anthropic SDK (`generator.ts`) are dynamically imported in `publish.ts` to avoid bundling in page renders
- **Firebase lazy init**: `firebase.ts` uses a Proxy so imports don't crash during build
- **UI text**: Always use `UI_TRANSLATIONS[lang]` from `src/lib/i18n.ts` — never hardcode user-facing strings
- **Article IDs**: Follow pattern `{category}-{slug}-{lang}` (e.g., `derma-gangnam-botox-ko`)
- **ISR**: Category pages revalidate at 1800s, articles at 3600s
- **Scraper delays**: 2-3s between requests to avoid rate limiting on Naver/Kakao
- **Firestore queries**: Avoid composite indexes — sort in JavaScript instead
- **No emojis**: Neither in UI code nor in Claude-generated article content
- **Logo/favicon**: `/img/shape-16.png`
- **Site name**: "Korea Beauty Guide" (all languages)

### Environment Variables

Required: `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PROJECT_ID`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `CRON_SECRET`
