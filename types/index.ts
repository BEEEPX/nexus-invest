export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  imageUrl: string | null;
  source: {
    name: string;
    country: string;
    coordinates: [number, number];
  };
  publishedAt: string;
  category: 'markets' | 'stocks' | 'crypto' | 'economy' | 'real-estate' | 'general';
  sentiment: 'positive' | 'negative' | 'neutral';
  translatedTitle?: string;
  translatedDescription?: string;
  originalLanguage: string;
}

export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
}

export interface NewsApiResponse {
  articles: NewsArticle[];
  totalResults: number;
  page: number;
  pageSize: number;
}

export type LanguageOption = {
  code: string;
  label: string;
  nativeLabel: string;
};

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'pt', label: 'Português', nativeLabel: 'Português' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'es', label: 'Español', nativeLabel: 'Español' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'fr', label: 'Français', nativeLabel: 'Français' },
  { code: 'de', label: 'Deutsch', nativeLabel: 'Deutsch' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
];

export const NEWS_CATEGORIES = [
  { key: 'general', labelPt: 'Todos', labelEn: 'All' },
  { key: 'markets', labelPt: 'Mercados', labelEn: 'Markets' },
  { key: 'stocks', labelPt: 'Ações', labelEn: 'Stocks' },
  { key: 'crypto', labelPt: 'Cripto', labelEn: 'Crypto' },
  { key: 'economy', labelPt: 'Economia', labelEn: 'Economy' },
  { key: 'real-estate', labelPt: 'Imóveis', labelEn: 'Real Estate' },
] as const;
