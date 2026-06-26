import { NextRequest, NextResponse } from 'next/server';
import { newsQuerySchema } from '@/lib/validations';
import { getNews } from '@/lib/news';
import { translateArticle } from '@/lib/translate';
import { apiLimiter } from '@/lib/rate-limit';
import { getClientIp, applySecurityHeaders } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const headers = new Headers();
  applySecurityHeaders(headers);
  headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  const ip = getClientIp(request);
  const { success, remaining } = apiLimiter.check(30, ip);
  headers.set('X-RateLimit-Remaining', String(remaining));

  if (!success) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers });
  }

  const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = newsQuerySchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: parsed.error.flatten() },
      { status: 400, headers },
    );
  }

  const { category, lang, page, pageSize, q, translate } = parsed.data;

  try {
    const { articles, totalResults } = await getNews({ category, q, page, pageSize });

    const processedArticles =
      translate && lang !== 'en'
        ? await Promise.all(
            articles.map(async (article) => {
              const t = await translateArticle(
                { title: article.title, description: article.description },
                lang,
                article.originalLanguage,
              );
              return { ...article, ...t };
            }),
          )
        : articles;

    return NextResponse.json(
      { articles: processedArticles, totalResults, page, pageSize },
      { status: 200, headers },
    );
  } catch (err) {
    console.error('[/api/news]', err);
    return NextResponse.json({ error: 'Failed to fetch news.' }, { status: 500, headers });
  }
}
