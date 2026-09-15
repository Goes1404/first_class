import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, SlidersHorizontal, Search, ArrowRight, PackageSearch, LayoutGrid, ImageOff } from 'lucide-react';
import SEO from '@/components/SEO';
import { Product } from '@/types/database';
import { useProducts } from '@/hooks/useProducts';
import { useProductRatings } from '@/hooks/useProductRatings';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { preloadProductDetails } from '@/lib/preloadRoutes';

/** Categorias que contam como calçado. O recorte é por nome de categoria
 *  porque o catálogo não tem um campo de tipo — ajuste aqui se a loja usar
 *  outra nomenclatura. */
const SNEAKER_RE = /t[eê]nis|cal[çc]ad|sapato|sneaker|chuteira/i;

const ALL = '__todos__';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ─── Círculo de marca ─────────────────────────────────────────────────────
   Usa o logo cadastrado; sem logo, cai no monograma. */
const BrandCircle: React.FC<{ name: string; logo?: string; active: boolean; onClick: () => void }> = ({
  name, logo, active, onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className="flex flex-col items-center gap-2 w-[62px] shrink-0 bg-transparent border-0 p-0 cursor-pointer"
  >
    <span
      className={`h-[54px] w-[54px] rounded-full bg-white flex items-center justify-center overflow-hidden transition-all border-2 ${
        active ? 'border-blue-600 shadow-md shadow-blue-600/20' : 'border-slate-200 shadow-sm'
      }`}
    >
      {logo ? (
        <img src={logo} alt="" loading="lazy" className="h-[42px] w-[42px] rounded-full object-contain" />
      ) : (
        <span className="h-[42px] w-[42px] rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[17px] font-bold">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
    <span
      className={`text-[11px] font-semibold text-center leading-tight line-clamp-2 transition-colors ${
        active ? 'text-blue-600' : 'text-slate-500'
      }`}
    >
      {name}
    </span>
  </button>
);

/* ─── Card ─────────────────────────────────────────────────────────────── */
const SneakerCard: React.FC<{ product: Product; rating?: { avg_rating: number; review_count: number } }> = ({
  product, rating,
}) => (
  <Link
    to={`/produto/${product.id}`}
    onPointerEnter={preloadProductDetails}
    onTouchStart={preloadProductDetails}
    className="w-[156px] shrink-0 rounded-2xl border border-slate-200 bg-white p-3 hover:border-blue-300 hover:shadow-lg transition-all"
  >
    <div className="min-h-[42px]">
      {product.brand && (
        <span className="block text-[9px] font-bold tracking-[0.14em] text-slate-400 uppercase">{product.brand}</span>
      )}
      <span className="block mt-0.5 text-[13px] font-semibold text-slate-900 leading-tight line-clamp-2">
        {product.name}
      </span>
    </div>
    <div className="h-[74px] mt-1.5 flex items-center justify-center">
      {product.image ? (
        <img src={product.image} alt={product.name} loading="lazy" className="max-h-full max-w-full object-contain" />
      ) : (
        <ImageOff className="h-6 w-6 text-slate-300" aria-hidden="true" />
      )}
    </div>
    <div className="mt-2 flex items-center justify-between">
      <span className="text-sm font-bold text-slate-900">{brl(product.price)}</span>
      {rating && rating.review_count > 0 && (
        <span className="flex items-center gap-0.5">
          <Star className="h-[11px] w-[11px] text-amber-400 fill-amber-400" aria-hidden="true" />
          <span className="text-[10px] font-semibold text-slate-500">{rating.avg_rating.toFixed(1)}</span>
        </span>
      )}
    </div>
  </Link>
);

/* ─── Página ───────────────────────────────────────────────────────────── */
const Sneakers: React.FC = () => {
  const { usePageVisit } = useAnalytics();
  usePageVisit('tenis');

  const { data: products, isLoading, isError } = useProducts();
  const { data: ratings } = useProductRatings();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [brand, setBrand] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);

  const sneakers = useMemo(
    () => (products ?? []).filter((p) => SNEAKER_RE.test(p.category ?? '')),
    [products],
  );

  // Marcas do recorte, ordenadas por quantidade; o logo é o primeiro cadastrado.
  const brands = useMemo(() => {
    const map = new Map<string, { name: string; logo?: string; n: number }>();
    for (const p of sneakers) {
      const name = p.brand?.trim();
      if (!name) continue;
      const cur = map.get(name);
      if (cur) {
        cur.n += 1;
        cur.logo = cur.logo || p.brand_logo_url || undefined;
      } else {
        map.set(name, { name, logo: p.brand_logo_url || undefined, n: 1 });
      }
    }
    return [...map.values()].sort((a, b) => b.n - a.n);
  }, [sneakers]);

  const byBrand = useMemo(
    () => (brand === ALL ? sneakers : sneakers.filter((p) => p.brand?.trim() === brand)),
    [sneakers, brand],
  );

  // Balões: as categorias de calçado que existem de fato, com contagem
  // recalculada dentro da marca escolhida.
  const pills = useMemo(() => {
    const names = [...new Set(sneakers.map((p) => p.category).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    );
    return [
      { id: ALL, label: 'Todos', count: byBrand.length },
      ...names.map((n) => ({ id: n, label: n, count: byBrand.filter((p) => p.category === n).length })),
    ];
  }, [sneakers, byBrand]);

  const shown = useMemo(
    () => (category === ALL ? byBrand : byBrand.filter((p) => p.category === category)),
    [byBrand, category],
  );

  const featured = useMemo(
    () => sneakers.find((p) => p.is_featured) ?? sneakers[0],
    [sneakers],
  );

  const listTitle =
    (category === ALL ? 'Toda a coleção' : category) + (brand === ALL ? '' : ` · ${brand}`);

  return (
    <div className="min-h-screen bg-white pb-28">
      <SEO title="Tênis | JR Acessórios" description="Tênis para treino, corrida e o dia a dia." />

      {/* ═══ Barra superior ═══ */}
      <header className="sticky top-0 z-30 bg-white">
        <div className="mx-auto max-w-5xl px-4 h-16 grid grid-cols-[44px_1fr_44px] items-center">
          <Link to="/produtos" aria-label="Filtros" className="flex items-center text-slate-900">
            <SlidersHorizontal className="h-[22px] w-[22px]" />
          </Link>
          <div className="flex flex-col items-center leading-none">
            <span className="text-[17px] font-bold text-slate-900">Tênis</span>
            <span className="mt-0.5 text-[9px] font-semibold tracking-[0.22em] text-blue-600">JR ACESSÓRIOS</span>
          </div>
          <Link to="/produtos" aria-label="Buscar" className="flex items-center justify-end text-slate-900">
            <Search className="h-[22px] w-[22px]" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        {/* ═══ Hero ═══ */}
        <section className="relative pt-2 pb-5">
          {/* A imagem fica presa à altura do letreiro: sobrepõe o título,
              como na referência, sem nunca alcançar o subtítulo abaixo. */}
          <div className="relative">
            <h1 className="text-[58px] leading-[0.88] font-bold tracking-[-0.045em] text-slate-900">
              PISE
              <span className="block text-blue-600">LEVE.</span>
            </h1>
            {featured?.image && (
              <img
                src={featured.image}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 my-auto right-[-10px] w-[190px] max-w-[52%] max-h-[104px] object-contain -rotate-[7deg] drop-shadow-xl"
              />
            )}
          </div>
          <p className="relative z-10 mt-5 max-w-[210px] text-[12.5px] leading-relaxed text-slate-500">
            Tênis para treino, corrida e o dia a dia.
          </p>
        </section>

        {/* ═══ Marcas ═══ */}
        {brands.length > 0 && (
          <section aria-label="Marcas">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-bold text-slate-900">Marcas</h2>
            </div>
            <div className="flex gap-3.5 overflow-x-auto pt-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setBrand(ALL)}
                aria-pressed={brand === ALL}
                className="flex flex-col items-center gap-2 w-[62px] shrink-0 bg-transparent border-0 p-0 cursor-pointer"
              >
                <span
                  className={`h-[54px] w-[54px] rounded-full bg-white flex items-center justify-center transition-all border-2 ${
                    brand === ALL ? 'border-blue-600 shadow-md shadow-blue-600/20' : 'border-slate-200 shadow-sm'
                  }`}
                >
                  <LayoutGrid className={`h-5 w-5 ${brand === ALL ? 'text-blue-600' : 'text-slate-400'}`} />
                </span>
                <span
                  className={`text-[11px] font-semibold ${brand === ALL ? 'text-blue-600' : 'text-slate-500'}`}
                >
                  Todas
                </span>
              </button>
              {brands.map((b) => (
                <BrandCircle
                  key={b.name}
                  name={b.name}
                  logo={b.logo}
                  active={brand === b.name}
                  onClick={() => setBrand(brand === b.name ? ALL : b.name)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ═══ Balões de categoria ═══ */}
        {pills.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pt-2.5 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {pills.map((p) => {
              const on = p.id === category;
              const empty = p.count === 0 && !on;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCategory(p.id)}
                  aria-pressed={on}
                  className={`h-11 pl-4 pr-2 rounded-full text-[13px] font-semibold shrink-0 flex items-center gap-2 border transition-all ${
                    on
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25'
                      : `bg-white border-slate-200 shadow-sm ${empty ? 'text-slate-300' : 'text-slate-600'}`
                  }`}
                >
                  <span className="whitespace-nowrap">{p.label}</span>
                  <span
                    className={`min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      on ? 'bg-white/25 text-white' : empty ? 'bg-slate-50 text-slate-300' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {p.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ═══ Destaque ═══ */}
        {featured && (
          <section className="pt-5">
            <h2 className="text-base font-bold text-slate-900">Destaque</h2>
            <div className="mt-2.5 rounded-2xl bg-slate-100 p-3.5 relative">
              <button
                type="button"
                onClick={() => toggleWishlist(featured.id)}
                aria-label={
                  isInWishlist(featured.id)
                    ? `Remover ${featured.name} dos favoritos`
                    : `Adicionar ${featured.name} aos favoritos`
                }
                className="absolute top-2 right-2 h-11 w-11 flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer"
              >
                <span className="h-[34px] w-[34px] rounded-full bg-white shadow flex items-center justify-center">
                  <Heart
                    className={`h-[17px] w-[17px] ${
                      isInWishlist(featured.id) ? 'text-rose-600 fill-rose-600' : 'text-slate-400'
                    }`}
                  />
                </span>
              </button>
              <Link to={`/produto/${featured.id}`} className="block">
                <div className="h-[120px] flex items-center justify-center">
                  {featured.image ? (
                    <img src={featured.image} alt={featured.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <ImageOff className="h-8 w-8 text-slate-300" aria-hidden="true" />
                  )}
                </div>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    {featured.brand && (
                      <span className="block text-[10px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                        {featured.brand}
                      </span>
                    )}
                    <span className="block mt-0.5 text-base font-bold text-slate-900">{featured.name}</span>
                    {ratings?.[featured.id]?.review_count ? (
                      <span className="mt-1 flex items-center gap-1.5">
                        <Star className="h-[13px] w-[13px] text-amber-400 fill-amber-400" aria-hidden="true" />
                        <span className="text-[11px] font-semibold text-slate-600">
                          {ratings[featured.id].avg_rating.toFixed(1)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({ratings[featured.id].review_count} avaliações)
                        </span>
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[19px] font-bold text-slate-900 whitespace-nowrap">{brl(featured.price)}</span>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* ═══ Lista ═══ */}
        <section className="pt-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-bold text-slate-900">{listTitle}</h2>
            <Link to="/produtos" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Ver mais
            </Link>
          </div>

          {isLoading && (
            <div className="flex gap-3 pt-3 overflow-hidden" aria-busy="true">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-[156px] shrink-0 rounded-2xl border border-slate-200 p-3">
                  <div className="h-4 w-4/5 rounded bg-slate-100 animate-pulse" />
                  <div className="h-[74px] mt-3 rounded-xl bg-slate-100 animate-pulse" />
                  <div className="h-4 w-1/2 mt-3 rounded bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <p className="mt-3 rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-500">
              Não foi possível carregar os produtos agora. Atualize a página para tentar de novo.
            </p>
          )}

          {!isLoading && !isError && shown.length > 0 && (
            <div className="flex gap-3 pt-3 pb-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {shown.map((p) => (
                <SneakerCard key={p.id} product={p} rating={ratings?.[p.id]} />
              ))}
            </div>
          )}

          {!isLoading && !isError && shown.length === 0 && (
            <div className="mt-3 rounded-2xl border border-slate-200 p-8 flex flex-col items-center text-center gap-2">
              <PackageSearch className="h-8 w-8 text-slate-300" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-700">
                {sneakers.length === 0 ? 'Nenhum tênis cadastrado ainda' : 'Nenhum tênis nesse filtro'}
              </p>
              <p className="text-xs text-slate-500">
                {sneakers.length === 0
                  ? 'Cadastre produtos numa categoria de calçado para eles aparecerem aqui.'
                  : 'Toque em “Todas” e “Todos” para ver a coleção inteira.'}
              </p>
              {sneakers.length === 0 && (
                <Link
                  to="/produtos"
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600"
                >
                  Ver todos os produtos <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Sneakers;
