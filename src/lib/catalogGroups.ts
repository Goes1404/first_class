/**
 * Grupos do catálogo (calçados, roupas, áudio, eletrônicos).
 *
 * O catálogo não tem um campo de tipo de produto, então o recorte é feito pelo
 * nome da categoria. Fica num lugar só para as abas, os links da home e os
 * redirecionamentos de /produto/:id nunca discordarem entre si.
 */

const SNEAKER_RE = /t[eê]nis|cal[çc]ad|sapato|sneaker|chuteira|sand[aá]lia|chinelo|bota/i;

// `cal[çc]a(?!d)` casa "calça" e "calças" mas não "calçado" — sem isso todo
// calçado seria classificado como roupa também.
const AUDIO_RE = /fone|headphone|headset|earbud|[aá]udio|caixa de som|speaker|soundbar/i;

const APPAREL_RE =
  /camiseta|camisa|blusa|moletom|jaqueta|casaco|agasalho|cal[çc]a(?!d)|bermuda|short|vestido|saia|regata|roupa|su[eé]ter|cardig|macac[ãa]o|polo|top\b|conjunto/i;

export const isSneakerCategory = (category?: string | null) => SNEAKER_RE.test(category ?? '');

/** Calçado vence o empate: "Calçados" contém "calça". */
export const isApparelCategory = (category?: string | null) =>
  !isSneakerCategory(category) && APPAREL_RE.test(category ?? '');

export const isAudioCategory = (category?: string | null) => AUDIO_RE.test(category ?? '');

// ─── Eletrônicos ────────────────────────────────────────────────────────────
// Três recortes dentro da mesma aba; "phone" solto ficou de fora de propósito,
// senão "Headphone" viraria celular.
const PHONE_RE = /iphone|celular|smartphone|galaxy|xiaomi|motorola|android/i;
const TABLET_RE = /tablet|ipad/i;
const LAPTOP_RE = /notebook|laptop|macbook|computador|desktop|chromebook|\bpcs?\b/i;

export type ElectronicsKind = 'celulares' | 'tablets' | 'notebooks';

export const ELECTRONICS_KINDS: ReadonlyArray<{ id: ElectronicsKind; label: string }> = [
  { id: 'celulares', label: 'Celulares' },
  { id: 'tablets', label: 'Tablets' },
  { id: 'notebooks', label: 'Notebooks' },
];

/** Recorte de eletrônico da categoria, ou null quando ela não é eletrônico. */
export const electronicsKind = (category?: string | null): ElectronicsKind | null => {
  const c = category ?? '';
  if (isAudioCategory(c)) return null;
  if (PHONE_RE.test(c)) return 'celulares';
  if (TABLET_RE.test(c)) return 'tablets';
  if (LAPTOP_RE.test(c)) return 'notebooks';
  return null;
};

export const isElectronicsCategory = (category?: string | null) => electronicsKind(category) !== null;

export interface CollectionGroup {
  /** Prefixo das rotas: /<slug> e, quando houver, /<slug>/:id */
  slug: 'tenis' | 'roupas' | 'fones' | 'eletronicos';
  /** Se o grupo tem tela de compra própria — só esses redirecionam /produto/:id. */
  hasPurchasePage: boolean;
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
  hasPurchasePage: true,
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
  hasPurchasePage: true,
  matches: isApparelCategory,
};

export const AUDIO: CollectionGroup = {
  slug: 'fones',
  title: 'Áudio',
  analyticsKey: 'fones',
  headline: ['OUÇA', 'CADA DETALHE.'],
  tagline: 'Fones e caixas de som escolhidos pelo que importa: o som.',
  seoTitle: 'Fones de ouvido | JR Acessórios',
  emptyTitle: 'Nenhum fone cadastrado ainda',
  emptyHint: 'Cadastre produtos numa categoria de áudio para eles aparecerem aqui.',
  hasPurchasePage: false,
  matches: isAudioCategory,
};

export const ELECTRONICS: CollectionGroup = {
  slug: 'eletronicos',
  title: 'Eletrônicos',
  analyticsKey: 'eletronicos',
  headline: ['Seu próximo', 'upgrade.'],
  tagline: 'Celulares, tablets e notebooks, no PIX ou em até 10× no cartão.',
  seoTitle: 'Celulares, tablets e notebooks | JR Acessórios',
  emptyTitle: 'Nenhum eletrônico cadastrado ainda',
  emptyHint: 'Cadastre produtos numa categoria de celular, tablet ou notebook para eles aparecerem aqui.',
  hasPurchasePage: true,
  matches: isElectronicsCategory,
};

/** Grupo dono de uma categoria, ou null quando ela não pertence a nenhum. */
export const groupForCategory = (category?: string | null): CollectionGroup | null =>
  isSneakerCategory(category)
    ? SNEAKERS
    : isApparelCategory(category)
      ? APPAREL
      : isAudioCategory(category)
        ? AUDIO
        : isElectronicsCategory(category)
          ? ELECTRONICS
          : null;
