import { NextRequest, NextResponse } from 'next/server';
import { translateSchema } from '@/lib/validations';
import { translateText } from '@/lib/translate';
import { translateLimiter } from '@/lib/rate-limit';
import { getClientIp, applySecurityHeaders } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const headers = new Headers();
  applySecurityHeaders(headers);

  const ip = getClientIp(request);
  const { success } = translateLimiter.check(20, ip);

  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400, headers });
  }

  const parsed = translateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.flatten() },
      { status: 400, headers },
    );
  }

  const { text, from, to } = parsed.data;

  try {
    const translatedText = await translateText(text, to, from);
    return NextResponse.json({ translatedText }, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: 'Translation failed.' }, { status: 500, headers });
  }
}
