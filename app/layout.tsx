import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nexus Invest — Notícias de Investimentos Globais',
  description:
    'Acompanhe notícias de investimentos do mundo inteiro, traduzidas automaticamente em tempo real, com visualização 3D interativa.',
  keywords: 'investimentos, mercado financeiro, ações, criptomoedas, economia, notícias financeiras',
  authors: [{ name: 'Nexus Invest' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Nexus Invest',
    description: 'Notícias de investimentos globais em tempo real com tradução automática',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: { card: 'summary_large_image', title: 'Nexus Invest' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#060a14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
