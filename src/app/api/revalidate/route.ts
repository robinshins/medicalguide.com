import { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

// Invalidate the 'articles' cache (used by unstable_cache wrappers in src/lib/articles.ts)
// after a new article is published. Called from:
//   - /api/publish (internal) after publishArticle()
//   - publish-action.js (GitHub Actions) via fetch after writing to Firestore
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag') || 'articles';
  revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tag, now: Date.now() });
}
