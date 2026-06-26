'use client';

import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es, zhCN, ja, fr, de } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import type { NewsArticle } from '@/types';

const LOCALES: Record<string, Locale> = { pt: ptBR, en: enUS, es, zh: zhCN, ja, fr, de };

const SENTIMENT_CONFIG = {
  positive: { label: '▲', classes: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/6' },
  negative: { label: '▼', classes: 'text-red-400 border-red-500/25 bg-red-500/6' },
  neutral:  { label: '●', classes: 'text-slate-400 border-slate-500/25 bg-slate-500/6' },
};

const CAT_LABELS: Record<string, string> = {
  markets: 'Mercados', stocks: 'Ações', crypto: 'Cripto',
  economy: 'Economia', 'real-estate': 'Imóveis', general: 'Geral',
};

const FLAG: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', JP: '🇯🇵', HK: '🇭🇰',
  BR: '🇧🇷', DE: '🇩🇪', FR: '🇫🇷',
};

interface NewsCardProps {
  article: NewsArticle;
  lang: string;
  index: number;
}

export function NewsCard({ article, lang, index }: NewsCardProps) {
  const locale = LOCALES[lang] ?? enUS;
  const title  = article.translatedTitle ?? article.title;
  const desc   = article.translatedDescription ?? article.description;
  const sent   = SENTIMENT_CONFIG[article.sentiment];

  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale });
  } catch {
    timeAgo = '';
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
      className="group relative flex flex-col rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm
                 hover:bg-white/7 hover:border-white/16 hover:shadow-lg hover:shadow-cyan-500/5
                 transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      {article.imageUrl && (
        <div className="relative h-36 overflow-hidden flex-shrink-0">
          <img
            src={article.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent" />
        </div>
      )}

      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${sent.classes}`}>
            {sent.label} {article.sentiment}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/8 text-cyan-400 border border-cyan-500/18">
            {CAT_LABELS[article.category] ?? article.category}
          </span>
          <span className="ml-auto text-xs text-gray-600 tabular-nums">{timeAgo}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white/90 text-sm leading-snug line-clamp-2
                       group-hover:text-white transition-colors duration-150">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 flex-1">
          {desc}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base leading-none" aria-hidden="true">
              {FLAG[article.source.country] ?? '🌐'}
            </span>
            <span className="text-xs text-gray-500 truncate">{article.source.name}</span>
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-cyan-500 hover:text-cyan-300 transition-colors duration-150 flex-shrink-0"
            aria-label={`Ler ${title}`}
          >
            Ler
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Hover glow border */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ring-1 ring-cyan-500/15" />
    </motion.article>
  );
}
