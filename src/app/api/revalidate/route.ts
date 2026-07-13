import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { assertValidSignature } from '@sanity/webhook';

import { TAGS } from '@/sanity/queries';

// Configure this URL as a Sanity webhook (Studio → API → Webhooks) for
// create/update/delete on article, author, pillar, branch, and topic,
// with the secret below set as SANITY_REVALIDATE_SECRET.
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: 'SANITY_REVALIDATE_SECRET is not set' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('sanity-webhook-signature') ?? '';

  try {
    await assertValidSignature(body, signature, secret);
  } catch {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body) as { _type?: string };
  const tag = payload._type && payload._type in TAGS ? TAGS[payload._type as keyof typeof TAGS] : undefined;

  if (!tag) {
    return NextResponse.json({ message: `Unrecognised document type: ${payload._type}` }, { status: 400 });
  }

  revalidateTag(tag, 'max');
  return NextResponse.json({ revalidated: true, tag });
}
