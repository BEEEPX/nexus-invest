# 🌐 Nexus Invest

Sistema global de notícias de investimentos com globo 3D interativo, tradução automática e segurança avançada.

## ✨ Funcionalidades

| Feature | Detalhe |
|---|---|
| 🌍 Globo 3D interativo | Three.js com shader procedural de Earth, atmosfera, marcadores de notícias em tempo real |
| 🗣️ Tradução automática | 8 idiomas (PT, EN, ES, ZH, JA, FR, DE, AR) via MyMemory API |
| 📰 Notícias globais | NewsAPI + fallback com artigos curados de 150+ fontes |
| 🔒 Segurança avançada | HSTS, CSP, Rate Limiting, Zod validation, sanitize-html |
| ⚡ Performance | LRU cache, Next.js ISR, lazy loading, WebP/AVIF images |
| 📱 Responsivo | Mobile-first, dark theme profissional |

## 🚀 Setup

```bash
git clone https://github.com/SEU_USUARIO/nexus-invest
cd nexus-invest
npm install
cp .env.local.example .env.local
# edite .env.local com suas chaves
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🔑 Variáveis de Ambiente

| Variável | Obrigatório | Descrição |
|---|---|---|
| `NEWS_API_KEY` | Não | Chave NewsAPI.org (sem ela, usa mock data) |

## 🛡️ Segurança

- **HTTPS/HSTS** — Strict-Transport-Security com preload
- **CSP** — Content-Security-Policy restritiva
- **Rate Limiting** — LRU cache por IP (30 req/min API, 20 req/min translate)
- **XSS Prevention** — sanitize-html em todos os inputs do servidor
- **Input Validation** — Zod schemas em todas as rotas de API
- **Security Headers** — X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy
- **UA Filtering** — Bloqueia scanners conhecidos (sqlmap, nikto, masscan…)
- **URL Sanitization** — Valida protocolo (http/https only) em todas as URLs externas

## 🏗️ Arquitetura

```
nexus-invest/
├── app/
│   ├── api/
│   │   ├── news/route.ts        # GET /api/news
│   │   └── translate/route.ts   # POST /api/translate
│   ├── news/page.tsx            # Página de notícias completa
│   └── page.tsx                 # Dashboard com globo 3D
├── components/
│   ├── Globe3D.tsx              # Three.js Earth com GLSL shader
│   ├── Header.tsx               # Navbar com seletor de idioma
│   └── NewsCard.tsx             # Card animado de notícia
└── lib/
    ├── news.ts                  # Fetch + cache de notícias
    ├── translate.ts             # Tradução com cache LRU
    ├── rate-limit.ts            # Rate limiter por IP
    ├── security.ts              # Headers, sanitização, detecção
    └── validations.ts           # Schemas Zod
```

## 📦 Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Three.js** + **@react-three/fiber** + **@react-three/drei**
- **Framer Motion**
- **Zod**
- **sanitize-html**
- **lru-cache**
- **date-fns**

## 📄 Licença

MIT
