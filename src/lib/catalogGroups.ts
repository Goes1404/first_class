/**
 * Grupos do catálogo (calçados, roupas).
 *
 * O catálogo não tem um campo de tipo de produto, então o recorte é feito pelo
 * nome da categoria. Fica num lugar só para as abas, os links da home e os
 * redirecionamentos de /produto/:id nunca discordarem entre si.
 */

const SNEAKER_RE = /t[eê]nis|cal[çc]ad|sapato|sneaker|chuteira|sand[aá]lia|chinelo|bota/i;

// `cal[çc]a(?!d)` casa "calça" e "calças" mas não "calçado" — sem isso todo
// calçado seria classificado como roupa também.
const APPAREL_RE =
  /camiseta|camisa|blusa|moletom|jaqueta|casaco|agasalho|cal[çc]a(?!d)|bermuda|short|vestido|saia|regata|roupa|su[eé]ter|cardig|macac[ãa]o|polo|top\b|conjunto/i;

export const isSneakerCategory = (category?: string | null) => SNEAKER_RE.test(category ?? '');

/** Calçado vence o empate: "Calçados" contém "calça". */
export const isApparelCategory = (category?: string | null) =>
  !isSneakerCategory(category) && APPAREL_RE.test(category ?? '');

export interface CollectionGroup {
  /** Prefixo das rotas: /<slug> e /<slug>/:id */
  slug: 'tenis' | 'roupas';
  /** Título da barra superior. */
  title: string;
  /** Nome usado nas métricas de página. */
  analyticsKey: string;
  headline: [string, string];
  tagline: string;
  seoTitle: string;
  emptyTitle: string;
  emptyHint: string;
  matches: (category?: string | null) => boolean;
}

export const SNEAKERS: CollectionGroup = {
  slug: 'tenis',
  title: 'Tênis',
  analyticsKey: 'tenis',
  headline: ['PISE', 'LEVE.'],
  tagline: 'Tênis para treino, corrida e o dia a dia.',
  seoTitle: 'Tênis | JR Acessórios',
  emptyTitle: 'Nenhum tênis cadastrado ainda',
  emptyHint: 'Cadastre produtos numa categoria de calçado para eles aparecerem aqui.',
  matches: isSneakerCategory,
};

export const APPAREL: CollectionGroup = {
  slug: 'roupas',
  title: 'Roupas',
  analyticsKey: 'roupas',
  headline: ['VISTA', 'O SEU.'],
  tagline: 'Peças para o dia a dia, treino e as saídas da semana.',
  seoTitle: 'Roupas | JR Acessórios',
  emptyTitle: 'Nenhuma peça cadastrada ainda',
  emptyHint: 'Cadastre produtos numa categoria de roupa para eles aparecerem aqui.',
  matches: isApparelCategory,
};

/** Grupo dono de uma categoria, ou null quando ela não pertence a nenhum. */
export const groupForCategory = (category?: string | null): CollectionGroup | null =>
  isSneakerCategory(category) ? SNEAKERS : isApparelCategory(category) ? APPAREL : null;
