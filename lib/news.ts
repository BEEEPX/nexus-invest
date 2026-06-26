import { LRUCache } from 'lru-cache';
import type { NewsArticle } from '@/types';
import { sanitizeText, sanitizeUrl } from './security';

type CacheEntry = { articles: NewsArticle[]; totalResults: number };
const cache = new LRUCache<string, CacheEntry>({ max: 100, ttl: 1000 * 60 * 5 });

const COORDS: Record<string, [number, number]> = {
  'reuters.com': [51.5074, -0.1278],
  'bloomberg.com': [40.7128, -74.006],
  'wsj.com': [40.7128, -74.006],
  'ft.com': [51.5074, -0.1278],
  'cnbc.com': [40.7128, -74.006],
  'marketwatch.com': [40.7128, -74.006],
  'nikkei.com': [35.6762, 139.6503],
  'scmp.com': [22.3193, 114.1694],
  'valor.com.br': [-23.5505, -46.6333],
  'handelsblatt.com': [50.1109, 8.6821],
  'les-echos.fr': [48.8566, 2.3522],
};

function coords(url: string): [number, number] {
  for (const [domain, c] of Object.entries(COORDS)) {
    if (url.includes(domain)) return c;
  }
  return [20 + Math.random() * 40, -60 + Math.random() * 120];
}

function country(url: string): string {
  if (url.includes('.br')) return 'BR';
  if (url.includes('.jp') || url.includes('nikkei')) return 'JP';
  if (url.includes('.hk') || url.includes('scmp')) return 'HK';
  if (url.includes('.uk') || url.includes('ft.com')) return 'GB';
  if (url.includes('.de') || url.includes('handelsblatt')) return 'DE';
  if (url.includes('.fr') || url.includes('les-echos')) return 'FR';
  return 'US';
}

const MOCK_ARTICLES: NewsArticle[] = [
  {
    id: 'm1', title: 'Federal Reserve Signals Rate Pause Amid Cooling Inflation',
    description: 'The Federal Reserve indicated it may hold interest rates steady as recent CPI data shows inflation moving toward the 2% target.',
    content: '', url: '#', imageUrl: null,
    source: { name: 'Reuters', country: 'US', coordinates: [40.7128, -74.006] },
    publishedAt: new Date(Date.now() - 1800000).toISOString(),
    category: 'economy', sentiment: 'positive', originalLanguage: 'en',
  },
  {
    id: 'm2', title: 'Bitcoin Breaks $75,000 as ETF Inflows Surge to Record High',
    description: 'Bitcoin surged past $75,000 driven by record inflows into spot Bitcoin ETFs and growing institutional adoption.',
    content: '', url: '#', imageUrl: null,
    source: { name: 'Bloomberg', country: 'US', coordinates: [40.7128, -74.006] },
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    category: 'crypto', sentiment: 'positive', originalLanguage: 'en',
  },
  {
    id: 'm3', title: 'Nikkei 225 Hits Record as Yen Weakens, Boosting Exporters',
    description: 'Japan\'s Nikkei 225 index surged to a new all-time high as a weaker yen provided a tailwind to major exporters.',
    content: '', url: '#', imageUrl: null,
    source: { name: 'Nikkei Asia', country: 'JP', coordinates: [35.6762, 139.6503] },
    publishedAt: new Date(Date.now() - 5400000).toISOString(),
    category: 'markets', sentiment: 'positive', originalLanguage: 'en',
  },
  {
    id: 'm4', title: 'ECB Holds Rates as Euro-Area Growth Shows Resilience',
    description: 'The European Central Bank kept its key rates unchanged, citing resilient growth data and steady progress on inflation.',
    content: '', url: '#', imageUrl: null,
    source: { name: 'Financial Times', country: 'GB', coordinates: [51.5074, -0.1278] },
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    category: 'economy', sentiment: 'neutral', originalLanguage: 'en',
  },
  {
    id: 'm5', title: 'Nvidia Stock Climbs on AI Server Demand Outlook',
    description: 'Shares of Nvidia advanced after analysts raised price targets citing surging demand for AI training infrastructure.',
    content: '', url: '#', imageUrl: null,
    source: { name: 'CNBC', country: 'US', coordinates: [40.7128, -74.006] },
    publishedAt: new Date(Date.now() - 9000000).toISOString(),
    category: 'stocks', sentiment: 'positive', originalLanguage: 'en',
  },
  {
    id: 'm6', title: 'Banco Central Mantém Selic em 10,5% e Sinaliza Estabilidade',
    description: 'O Comitê de Política Monetária manteve a taxa Selic em 10,5% ao ano, reforçando o compromisso com a meta de inflação.',
    content: '', url: '#', imageUrl: null,
    source: { name: 'Valor Econômico', country: 'BR', coordinates: [-23.5505, -46.6333] },
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    category: 'economy', sentiment: 'neutral', originalLanguage: 'pt',
  },
  {
    id: 'm7', title: 'Gold Reaches New All-Time High Above $2,500 per Ounce',
    description: 'Gold prices hit a record $2,500 per ounce as geopolitical tensions and central bank buying drove safe-haven demand.',
    content: '', url: '#', imageUrl: null,
    source: { name: 'MarketWatch', country: 'US', coordinates: [40.7128, -74.006] },
    publishedAt: new Date(Date.now() - 12600000).toISOString(),
    category: 'markets', sentiment: 'neutral', originalLanguage: 'en',
  },
  {
    id: 'm8', title: 'Hong Kong IPO Pipeline Swells as Tech Firms Eye Listings',
    description: 'Several Chinese technology companies have filed for IPOs on the Hong Kong Stock Exchange, signaling renewed confidence.',
    content: '', url: '#', imageUrl: null,
    source: { name: 'SCMP', country: 'HK', coordinates: [22.3193, 114.1694] },
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    category: 'markets', sentiment: 'positive', originalLanguage: 'en',
  },
  {
    id: 'm9', title: 'S&P 500 Sets Record Close as Earnings Season Beats Estimates',
    description: 'The S&P 500 closed at a new record high as over 75% of companies reporting Q2 earnings exceeded analyst expectations.',
    content: '', url: '#', imageUrl: null,
    source: { name: 'WSJ', country: 'US', coordinates: [40.7128, -74.006] },
    publishedAt: new Date(Date.now() - 16200000).toISOString(),
    category: 'stocks', sentiment: 'positive', originalLanguage: 'en',
  },
  {
    id: 'm10', title: 'DAX Rallies as German Manufacturing PMI Beats Expectations',
    description: 'Germany\'s benchmark DAX index gained 1.4% after manufacturing data came in above forecasts, easing recession fears.',
    content: '', url: '#', imageUrl: null,
    source: { name: 'Handelsblatt', country: 'DE', coordinates: [50.1109, 8.6821] },
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    category: 'markets', sentiment: 'positive', originalLanguage: 'en',
  },
  {
    id: 'm11', title: 'Real Estate Investment Trusts Outperform as Rate Cuts Loom',
    description: 'REITs across the US and Europe surged as bond yields fell on expectations of imminent central bank rate cuts.',
    content: '', url: '#', imageUrl: null,
    source: { name: 'Bloomberg', country: 'US', coordinates: [40.7128, -74.006] },
    publishedAt: new Date(Date.now() - 19800000).toISOString(),
    category: 'real-estate', sentiment: 'positive', originalLanguage: 'en',
  },
  {
    id: 'm12', title: 'Ethereum Upgrade Reduces Gas Fees by 80%, Boosting DeFi Activity',
    description: 'A major Ethereum protocol upgrade successfully cut average transaction fees by 80%, triggering a surge in DeFi protocols.',
    content: '', url: '#', imageUrl: null,
    source: { name: 'CoinDesk', country: 'US', coordinates: [40.7128, -74.006] },
    publishedAt: new Date(Date.now() - 21600000).toISOString(),
    category: 'crypto', sentiment: 'positive', originalLanguage: 'en',
  },
];

async function fromNewsApi(q: string, category: string, page: number, pageSize: number): Promise<CacheEntry> {
  const key = process.env.NEWS_API_KEY;
  if (!key) return { articles: MOCK_ARTICLES, totalResults: MOCK_ARTICLES.length };

  const terms: Record<string, string> = {
    markets: 'stock market finance',
    stocks: 'stocks shares earnings',
    crypto: 'cryptocurrency bitcoin ethereum',
    economy: 'economy GDP inflation interest rates',
    'real-estate': 'real estate property housing',
    general: 'investment finance markets',
  };

  const params = new URLSearchParams({
    q: q || terms[category] || 'investment',
    language: 'en',
    sortBy: 'publishedAt',
    page: String(page),
    pageSize: String(pageSize),
    apiKey: key,
  });

  const res = await fetch(`https://newsapi.org/v2/everything?${params}`, {
    signal: AbortSignal.timeout(10_000),
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`NewsAPI ${res.status}`);

  const data = await res.json() as { articles: unknown[]; totalResults: number };

  const articles: NewsArticle[] = (data.articles ?? [])
    .filter((a: unknown) => {
      const art = a as Record<string, unknown>;
      return art['title'] && art['url'] && art['title'] !== '[Removed]';
    })
    .map((a: unknown, i: number) => {
      const art = a as Record<string, unknown>;
      const url = String(art['url'] ?? '');
      return {
        id: `api-${page}-${i}`,
        title: sanitizeText(art['title']),
        description: sanitizeText(art['description'] ?? ''),
        content: sanitizeText(art['content'] ?? ''),
        url: sanitizeUrl(url) ?? '#',
        imageUrl: sanitizeUrl(art['urlToImage']) ?? null,
        source: {
          name: sanitizeText((art['source'] as Record<string, unknown>)?.['name'] ?? 'Unknown'),
          country: country(url),
          coordinates: coords(url),
        },
        publishedAt: String(art['publishedAt'] ?? new Date().toISOString()),
        category: (category as NewsArticle['category']),
        sentiment: 'neutral' as const,
        originalLanguage: 'en',
      };
    });

  return { articles, totalResults: data.totalResults ?? 0 };
}

export async function getNews(params: {
  category?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<CacheEntry> {
  const { category = 'general', q = '', page = 1, pageSize = 12 } = params;
  const key = `${category}|${q}|${page}|${pageSize}`;

  const hit = cache.get(key);
  if (hit) return hit;

  const result = await fromNewsApi(q, category, page, pageSize);
  cache.set(key, result);
  return result;
}
