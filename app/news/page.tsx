'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { NewsCard } from '@/components/NewsCard';
import type { NewsArticle } from '@/types';
import { NEWS_CATEGORIES } from '@/types';

export default function NewsPage() {
  const [lang, setLang]         = useState('pt');
  const [category, setCategory] = useState('general');
  const [query, setQuery]       = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);

  const load = useCallback(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      category, lang, translate: 'true',
      page: String(page), pageSize: '16',
      ...(query ? { q: query } : {}),
    });

    fetch(`/api/news?${params}`, { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d: { articles: NewsArticle[]; totalResults: number }) => {
        setArticles(d.articles ?? []);
        setTotal(d.totalResults ?? 0);
        setLoading(false);
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') { setError('Erro ao carregar.'); setLoading(false); }
      });

    return () => ctrl.abort();
  }, [lang, category, query, page]);

  useEffect(() => { return load(); }, [load]);
  useEffect(() => { setPage(1); }, [lang, category, query]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setQuery(String(fd.get('q') ?? '').trim().slice(0, 100));
  }

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Header lang={lang} onLangChange={setLang} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Notícias de Investimentos
          </h1>
          <p className="text-gray-500 text-sm">
            Fontes globais · Tradução automática · {total.toLocaleString('pt-BR')} artigos
          </p>
        </motion.div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            name="q"
            type="search"
            placeholder="Buscar notícias…"
            maxLength={100}
            defaultValue={query}
            className="flex-1 px-4 py-2.5 rounded-xl glass text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-cyan-500/40 transition"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/22 transition-colors"
          >
            Buscar
          </button>
        </form>

        {/* Category tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
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

        {/* Results */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl glass animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={load} className="px-5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {articles.map((a, i) => (
                <NewsCard key={a.id} article={a} lang={lang} index={i} />
              ))}
              {articles.length === 0 && (
                <p className="col-span-full text-center py-16 text-gray-600">
                  Nenhum resultado encontrado.
                </p>
              )}
            </div>

            {articles.length > 0 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-xl glass text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  ← Anterior
                </button>
                <span className="text-sm text-gray-500 px-3">Página {page}</span>
                <button onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl glass text-sm text-gray-400 hover:text-white transition-colors">
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
