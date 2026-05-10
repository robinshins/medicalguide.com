import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { publishArticle, initializeKeywordQueue } from '@/lib/publish';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// Manual publish trigger (for testing)
export async function POST(request: NextRequest) {
  const secret = process.env.PUBLISH_SECRET;
  if (!secret) {
    return Response.json({ error: 'Server misconfigured' }, { status: 500 });
  }
  const provided = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  if (body.action === 'init') {
    const count = await initializeKeywordQueue();
    return Response.json({ success: true, initialized: count });
  }

  const result = await publishArticle();
  return Response.json(result);
}
