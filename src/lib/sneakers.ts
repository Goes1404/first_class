/**
 * O catálogo não tem um campo de tipo de produto, então o recorte de calçados
 * é feito pelo nome da categoria. Fica num lugar só para a aba, o link da home
 * e o redirecionamento da página de produto nunca discordarem entre si.
 */
const SNEAKER_RE = /t[eê]nis|cal[çc]ad|sapato|sneaker|chuteira/i;

export const isSneakerCategory = (category?: string | null) => SNEAKER_RE.test(category ?? '');
