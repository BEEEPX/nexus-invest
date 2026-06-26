'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { NewsCard } from '@/components/NewsCard';
import type { NewsArticle } from '@/types';
import { NEWS_CATEGORIES } from '@/types';

/* Globe is WebGL — disable SSR */
const Globe3D = dynamic(
  () => import('@/components/Globe3D').then((m) => ({ default: m.Globe3D })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-40 h-40 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
      </div>
    ),
  },
);

/* ── Ticker ─────────────────────────────────────────────── */
const TICKERS = [
  { sym: 'BTC', val: '+2.4%', pos: true },
  { sym: 'ETH', val: '+1.8%', pos: true },
  { sym: 'S&P 500', val: '+0.6%', pos: true },
  { sym: 'IBOVESPA', val: '+1.2%', pos: true },
  { sym: 'NASDAQ', val: '+0.9%', pos: true },
  { sym: 'EUR/USD', val: '-0.3%', pos: false },
  { sym: 'GOLD', val: '+0.7%', pos: true },
  { sym: 'WTI OIL', val: '-1.1%', pos: false },
  { sym: 'DAX', val: '+0.4%', pos: true },
  { sym: 'NIKKEI', val: '+1.5%', pos: true },
];

function Ticker() {
  const items = [...TICKERS, ...TICKERS]; // duplicate for seamless loop
  return (
    <div className="overflow-hidden border-y border-white/6 bg-black/30 backdrop-blur py-2">
      <div className="ticker flex gap-10 whitespace-nowrap">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-medium">{t.sym}</span>
            <span className={t.pos ? 'text-emerald-400' : 'text-red-400'}>{t.val}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Stats ──────────────────────────────────────────────── */
const STATS = [
  { label: 'Fontes de notícias', value: '150+', icon: '🌐' },
  { label: 'Idiomas suportados', value: '8',    icon: '🗣️' },
  { label: 'Atualização',        value: '5 min', icon: '⚡' },
  { label: 'Proteção',           value: '100%', icon: '🛡️' },
];

/* ── Security panel ─────────────────────────────────────── */
const SEC_ITEMS = [
  { icon: '🔒', label: 'HTTPS/TLS',           desc: 'Comunicação criptografada end-to-end' },
  { icon: '🚦', label: 'Rate Limiting',        desc: 'Proteção contra DDoS e abuso de API' },
  { icon: '🧹', label: 'Sanitização XSS',      desc: 'Todas as entradas sanitizadas via Zod + sanitize-html' },
  { icon: '🛡️', label: 'Security Headers',     desc: 'HSTS, CSP, X-Frame-Options, nosniff…' },
  { icon: '✅', label: 'Validação de Input',    desc: 'Schemas Zod em todas as rotas de API' },
  { icon: '🔑', label: 'Segredos no servidor', desc: 'Chaves de API nunca expostas ao cliente' },
];

/* ── Page ─────────────────────────────────────────────────── */
export default function HomePage() {
  const [lang, setLang]           = useState('pt');
  const [category, setCategory]   = useState('general');
  const [articles, setArticles]   = useState<NewsArticle[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [secOpen, setSecOpen]     = useState(false);

  const fetchNews = useCallback(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      category,
      lang,
      translate: 'true',
      page: String(page),
      pageSize: '12',
    });

    fetch(`/api/news?${params}`, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ articles: NewsArticle[]; totalResults: number }>;
      })
      .then((d) => {
        setArticles(d.articles ?? []);
        setTotal(d.totalResults ?? 0);
        setLoading(false);
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') {
          setError('Falha ao carregar notícias. Tente novamente.');
          setLoading(false);
        }
      });

    return () => ctrl.abort();
  }, [lang, category, page]);

  useEffect(() => {
    const cleanup = fetchNews();
    return cleanup;
  }, [fetchNews]);

  /* Reset page on filter change */
  useEffect(() => { setPage(1); }, [lang, category]);

  return (
    <div className="min-h-screen bg-[#060a14] text-white overflow-x-hidden">
      <Header lang={lang} onLangChange={setLang} />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative h-screen flex flex-col items-center overflow-hidden">
        {/* Ambient gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(0,100,200,0.14),transparent)]" />
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#060a14] to-transparent" />

        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-40" />

        {/* Globe */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div className="w-full max-w-3xl h-full">
            <Globe3D articles={articles} />
          </div>
        </div>

        {/* Hero copy — sits over globe */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 mt-auto pb-28">
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-5xl md:text-7xl font-extrabold mb-4 glow-cyan bg-gradient-to-br from-cyan-300 via-blue-300 to-indigo-400 bg-clip-text text-transparent"
          >
            Nexus Invest
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-gray-400 text-lg max-w-lg mb-7"
          >
            Notícias de investimentos do mundo inteiro, traduzidas automaticamente em tempo real.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap gap-2.5 justify-center"
          >
            {[
              { dot: 'bg-emerald-400', text: 'Mercados ao Vivo' },
              { dot: 'bg-cyan-400',   text: 'Tradução Automática' },
              { dot: 'bg-violet-400', text: 'Segurança Avançada' },
            ].map(({ dot, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-gray-300"
              >
                <span className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />
                {text}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Ticker ─────────────────────────────────────────── */}
      <Ticker />

      {/* ── Stats ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon }) => (
            <div key={label} className="glass rounded-2xl p-5 text-center hover:border-cyan-500/20 transition-colors duration-300">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-2xl font-bold text-cyan-400 mb-1">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── News ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="flex items-center justify-between mb-5 gap-4">
          <h2 className="text-lg font-semibold text-white/90">Últimas Notícias</h2>
          {total > 0 && !loading && (
            <span className="text-xs text-gray-500">{total.toLocaleString('pt-BR')} resultados</span>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {NEWS_CATEGORIES.map(({ key, labelPt }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                category === key
                  ? 'bg-cyan-500/15 border border-cyan-500/35 text-cyan-300'
                  : 'glass text-gray-400 hover:text-white hover:bg-white/8'
              }`}
            >
              {labelPt}
            </button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl glass animate-pulse" />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center"
            >
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchNews}
                className="px-5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/18 transition-colors"
              >
                Tentar novamente
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${category}-${lang}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {articles.map((article, i) => (
                <NewsCard key={article.id} article={article} lang={lang} index={i} />
              ))}
              {articles.length === 0 && (
                <p className="col-span-full text-center py-16 text-gray-600">
                  Nenhuma notícia encontrada para esta categoria.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!loading && articles.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl glass text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <span className="text-sm text-gray-500 px-3">Página {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl glass text-sm text-gray-400 hover:text-white transition-colors"
            >
              Próxima →
            </button>
          </div>
        )}
      </section>

      {/* ── Security Panel ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <button
          onClick={() => setSecOpen((v) => !v)}
          className="w-full glass rounded-2xl p-5 flex items-center justify-between hover:border-cyan-500/20 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div className="text-left">
              <p className="font-semibold text-white/90 text-sm">Segurança do Sistema</p>
              <p className="text-xs text-gray-500">6 camadas de proteção ativas</p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${secOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {secOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {SEC_ITEMS.map(({ icon, label, desc }) => (
                  <div key={label} className="glass rounded-xl p-4 flex gap-3">
                    <span className="text-xl flex-shrink-0">{icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white/85 mb-0.5">{label}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/6 py-8 text-center">
        <p className="text-sm text-gray-600 mb-2">
          © 2024 <span className="text-gray-500 font-medium">Nexus Invest</span> — Dados para fins informativos. Não é consultoria financeira.
        </p>
        <p className="text-xs text-gray-700">
          Protegido por HTTPS · Rate Limiting · Sanitização XSS · CSP · HSTS · Validação Zod
        </p>
      </footer>
    </div>
  );
}
