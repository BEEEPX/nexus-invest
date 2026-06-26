import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, string>({ max: 2000, ttl: 1000 * 60 * 60 });

async function callMyMemory(text: string, from: string, to: string): Promise<string> {
  const params = new URLSearchParams({ q: text, langpair: `${from}|${to}` });
  const res = await fetch(`https://api.mymemory.translated.net/get?${params}`, {
    headers: { 'User-Agent': 'NexusInvest/1.0' },
    signal: AbortSignal.timeout(6000),
  });

  if (!res.ok) throw new Error(`MyMemory ${res.status}`);

  const data = (await res.json()) as {
    responseStatus: number;
    responseData: { translatedText: string };
  };

  if (data.responseStatus !== 200) throw new Error(`MyMemory status ${data.responseStatus}`);
  return data.responseData.translatedText;
}

export async function translateText(text: string, to: string, from = 'en'): Promise<string> {
  if (from === to || !text.trim()) return text;

  const key = `${from}|${to}|${text.slice(0, 120)}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const truncated = text.length > 900 ? `${text.slice(0, 900)}…` : text;

  try {
    const result = await callMyMemory(truncated, from, to);
    cache.set(key, result);
    return result;
  } catch {
    return text;
  }
}

export async function translateArticle(
  article: { title: string; description: string },
  targetLang: string,
  sourceLang = 'en',
): Promise<{ translatedTitle: string; translatedDescription: string }> {
  if (targetLang === sourceLang) {
    return { translatedTitle: article.title, translatedDescription: article.description };
  }

  const [translatedTitle, translatedDescription] = await Promise.all([
    translateText(article.title, targetLang, sourceLang),
    translateText(article.description, targetLang, sourceLang),
  ]);

  return { translatedTitle, translatedDescription };
}
