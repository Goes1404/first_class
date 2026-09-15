/**
 * Paleta da home "tech" — clara, azul, alto contraste.
 *
 * Fica isolada aqui de propósito: o resto da loja ainda usa o tema
 * escuro/dourado dos tokens globais em index.css. Assim a home nova pode ser
 * validada sem repintar as outras 30 páginas. Para levar este visual ao site
 * inteiro, estes valores viram os tokens de :root.
 */
export const TECH = {
  blue: '#2563eb',
  blueDark: '#1d4ed8',
  navy: '#0b1b3a',
  ink: '#0f172a',
  muted: '#64748b',
  line: '#e2e8f0',
  page: '#f1f5f9',
  surface: '#ffffff',
} as const;

/** Badges de produto — rótulo + cor, iguais aos da referência. */
export const BADGE_STYLES = {
  bestseller: 'bg-blue-600 text-white',
  trending: 'bg-emerald-500 text-white',
  popular: 'bg-violet-600 text-white',
  last: 'bg-amber-500 text-white',
} as const;

export type BadgeKind = keyof typeof BADGE_STYLES;
