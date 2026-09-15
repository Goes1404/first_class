import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Search, Heart, Star, ImageOff, ChevronRight,
  Smartphone, Tablet, Laptop, Truck, Zap, ShieldCheck, CreditCard, type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import { Product } from '@/types/database';
import { useProducts } from '@/hooks/useProducts';
import { useProductRatings } from '@/hooks/useProductRatings';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ELECTRONICS, ELECTRONICS_KINDS, electronicsKind, type ElectronicsKind } from '@/lib/catalogGroups';
import { preloadProducts, preloadElectronicsPurchase } from '@/lib/preloadRoutes';
import { Stagger, StaggerItem } from '@/components/animations/Stagger';
import { Pop } from '@/components/animations/Pop';
import { cardHover, cardTap, easing, spring } from '@/lib/motion';

const MotionLink = motion(Link);

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** "#abc" ou "#aabbcc" → rgba com a opacidade pedida. Cor inválida cai no azul da marca. */
const withAlpha = (hex: string | undefined, alpha: number) => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex?.trim() ?? '');
  const h = m ? (m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1]) : '2563eb';
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

const KIND_ICON: Record<ElectronicsKind, LucideIcon> = {
  celulares: Smartphone,
  tablets: Tablet,
  notebooks: Laptop,
};

/* Fundos dos cards do trilho: um tom suave por posição, como na vitrine. */
const TINTS = ['bg-slate-100', 'bg-indigo-50', 'bg-sky-50', 'bg-violet-50'];

const SECTION_MOTION = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5, ease: easing.smooth },
} as const;

/* ─── Card do trilho ─────────────────────────────────────────────────────── */
const RailCard: React.FC<{ product: Product; tint: string; rating?: { avg_rating: number; review_count: number } }> = ({
  product, tint, rating,
}) => (
  <MotionLink
    whileHover={cardHover}
    whileTap={cardTap}
    to={`/${ELECTRONICS.slug}/${product.id}`}
    onPointerEnter={preloadElectronicsPurchase}
    className={`group block w-[176px] shrink-0 snap-start rounded-[22px] p-3.5 ${tint} lg:w-auto`}
  >
    <div className="h-[150px] flex items-center justify-center">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain drop-shadow-[0_14px_18px_rgba(15,23,42,0.18)] group-hover:scale-[1.04] transition-transform duration-300"
        />
      ) : (
        <ImageOff className="h-7 w-7 text-slate-300" aria-hidden="true" />
      )}
    </div>
    <span className="mt-2.5 block text-sm font-bold text-slate-900 tracking-[-0.01em] leading-tight line-clamp-1">
      {product.name}
    </span>
    <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 min-h-[16px]">
      {product.brand || product.category}
      {rating && rating.review_count > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <Star className="h-[10px] w-[10px] text-amber-400 fill-amber-400" aria-hidden="true" />
          {rating.avg_rating.toFixed(1)}
        </>
      )}
    </span>
    <span className="mt-2.5 block text-base font-extrabold text-slate-900 tracking-[-0.02em] whitespace-nowrap">
      {brl(product.price)}
    </span>
    <span className="mt-0.5 block text-[10.5px] text-slate-400 whitespace-nowrap">
      10× de {brl(product.price / 10)} sem juros
    </span>
  </MotionLink>
);

/* ─── Página ───────────────────────────────────────────────────────────── */
const Electronics: React.FC = () => {
  const { usePageVisit } = useAnalytics();
  usePageVisit(ELECTRONICS.analyticsKey);

  const { data: products, isLoading, isError } = useProducts();
  const { data: ratings } = useProductRatings();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const items = useMemo(
    () => (products ?? []).filter((p) => ELECTRONICS.matches(p.category)),
    [products],
  );

  // Só os recortes que existem de fato no catálogo viram botão.
  const kinds = useMemo(
    () => ELECTRONICS_KINDS.filter((k) => items.some((p) => electronicsKind(p.category) === k.id)),
    [items],
  );
  const [kind, setKind] = useState<ElectronicsKind | null>(null);
  useEffect(() => {
    if (!kinds.length) return;
    if (!kind || !kinds.some((k) => k.id === kind)) setKind(kinds[0].id);
  }, [kinds, kind]);

  const hero = useMemo(() => items.find((p) => p.is_featured) ?? items[0], [items]);
  const heroRating = hero ? ratings?.[hero.id] : undefined;
  const storages = useMemo(() => hero?.sizes ?? [], [hero]);
  const colors = useMemo(() => hero?.colors ?? [], [hero]);

  const [storage, setStorage] = useState<string | undefined>();
  const [color, setColor] = useState<string | undefined>();
  useEffect(() => {
    setStorage(storages[0]);
    setColor(colors[0]?.name);
  }, [storages, colors]);

  const currentColor = colors.find((c) => c.name === color);
  const glow = withAlpha(currentColor?.hex, currentColor ? 0.55 : 0.45);

  const fromPrice = useMemo(
    () => (items.length ? Math.min(...items.map((p) => p.price)) : null),
    [items],
  );

  const rail = useMemo(
    () => items.filter((p) => electronicsKind(p.category) === kind && p.id !== hero?.id).slice(0, 8),
    [items, kind, hero],
  );
  const railTitle = kinds.find((k) => k.id === kind)?.label ?? 'Linha';

  const handleAdd = () => {
    if (!hero) return;
    addToCart(hero, { size: storage, color });
    toast({
      title: 'Adicionado ao carrinho',
      description: [hero.name, storage, color].filter(Boolean).join(' · '),
    });
  };

  const [word1, word2] = ELECTRONICS.headline;
  const fav = hero ? isInWishlist(hero.id) : false;

  return (
    <div className="min-h-screen overflow-x-clip bg-white pb-28">
      <SEO title={ELECTRONICS.seoTitle} description={ELECTRONICS.tagline} />

      {/* ═══ Barra superior ═══ */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-5xl px-3 h-14 grid grid-cols-[44px_1fr_44px] items-center">
          <Link to="/" aria-label="Voltar para a home" className="h-11 w-11 flex items-center justify-center text-slate-900">
            <ArrowLeft className="h-[22px] w-[22px]" />
          </Link>
          <div className="flex flex-col items-center leading-none">
            <span className="text-[9px] font-extrabold tracking-[0.26em] text-slate-900">JR ACESSÓRIOS</span>
            <span className="mt-0.5 text-[11px] font-medium text-slate-500">{ELECTRONICS.title}</span>
          </div>
          <Link
            to="/produtos"
            onPointerEnter={preloadProducts}
            aria-label="Buscar"
            className="h-11 w-11 flex items-center justify-center text-slate-900"
          >
            <Search className="h-[22px] w-[22px]" />
          </Link>
        </div>
      </header>

      {isLoading && (
        <div className="mx-auto max-w-5xl px-4 pt-6 space-y-4" aria-busy="true">
          <div className="h-10 w-2/3 rounded skeleton" />
          <div className="h-[220px] rounded-3xl skeleton" />
          <div className="h-12 rounded-full skeleton" />
          <div className="h-[420px] rounded-[28px] skeleton" />
        </div>
      )}

      {isError && (
        <p className="mx-auto max-w-5xl px-4 pt-10 text-center text-sm text-slate-500">
          Não foi possível carregar os produtos agora. Atualize a página para tentar de novo.
        </p>
      )}

      {!isLoading && !isError && !hero && (
        <div className="mx-auto max-w-5xl px-4 pt-16 text-center">
          <Smartphone className="mx-auto h-10 w-10 text-slate-200" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-slate-700">{ELECTRONICS.emptyTitle}</p>
          <p className="mt-1 text-xs text-slate-400">{ELECTRONICS.emptyHint}</p>
          <Link to="/produtos" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600">
            Ver todos os produtos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {hero && (
        <main className="mx-auto max-w-5xl px-4">
          {/* ═══ Hero ═══ */}
          <section className="relative overflow-visible pt-4 sm:pt-8 sm:grid sm:grid-cols-2 sm:items-center sm:gap-8">
            <div
              className="pointer-events-none absolute -right-16 -top-6 h-[300px] w-[300px] rounded-full sm:right-0 sm:top-0 sm:h-[380px] sm:w-[380px]"
              style={{ background: `radial-gradient(circle, ${withAlpha('#2563eb', 0.25)} 0%, rgba(255,255,255,0) 66%)` }}
              aria-hidden="true"
            />
            <div className="relative max-w-[214px] sm:max-w-none">
              <motion.span
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: easing.smooth }}
                className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.22em] text-blue-600"
              >
                <span className="block h-0.5 w-[18px] rounded bg-blue-600" aria-hidden="true" />
                ELETRÔNICOS
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: easing.smooth }}
                className="mt-3 text-[46px] leading-[0.92] font-extrabold tracking-[-0.05em] text-slate-900 sm:text-[64px]"
              >
                {word1.split(' ').map((w) => (
                  <span key={w} className="block">{w}</span>
                ))}
                <span
                  className="block text-[58px] leading-[0.95] tracking-[-0.02em] text-blue-600 sm:text-[78px]"
                  style={{ fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontWeight: 400 }}
                >
                  {word2}
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22, ease: easing.smooth }}
                className="mt-4 max-w-[190px] text-[13px] leading-relaxed text-slate-500 sm:max-w-xs sm:text-sm"
              >
                {ELECTRONICS.tagline}
              </motion.p>
              {fromPrice !== null && (
                <motion.span
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3, ease: easing.smooth }}
                  className="mt-4 inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full bg-slate-900 pl-3 pr-3.5 text-xs font-semibold text-white"
                >
                  <span className="block h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  A partir de {brl(fromPrice)}
                </motion.span>
              )}
            </div>

            {/* Produto flutuando: no celular sobrepõe o letreiro, no desktop ganha a coluna da direita. */}
            <div className="pointer-events-none absolute right-1.5 top-[30px] h-[240px] sm:relative sm:right-auto sm:top-auto sm:flex sm:h-[380px] sm:items-center sm:justify-center">
              {hero.image ? (
                <motion.img
                  src={hero.image}
                  alt=""
                  aria-hidden="true"
                  initial={{ opacity: 0, y: 24, rotate: -9 }}
                  animate={{ opacity: 1, y: [0, -10, 0], rotate: -9 }}
                  transition={{ opacity: { duration: 0.8 }, y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 } }}
                  className="h-full max-w-[150px] object-contain drop-shadow-[0_32px_36px_rgba(15,23,42,0.38)] sm:max-w-[260px]"
                />
              ) : null}
            </div>
          </section>

          {/* ═══ Seletor de categoria ═══ */}
          {kinds.length > 1 && (
            <motion.div {...SECTION_MOTION} className="pt-3 sm:pt-8">
              <div className="flex gap-1 rounded-full bg-slate-100 p-1 sm:max-w-md" role="tablist" aria-label="Tipo de produto">
                {kinds.map((k) => {
                  const on = k.id === kind;
                  const Icon = KIND_ICON[k.id];
                  return (
                    <button
                      key={k.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setKind(k.id)}
                      className={`relative flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full text-[12.5px] font-bold transition-colors ${
                        on ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {on && (
                        <motion.span
                          layoutId="electronics-kind"
                          transition={spring.snappy}
                          className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.10)]"
                          aria-hidden="true"
                        />
                      )}
                      <Icon className="relative h-4 w-4" aria-hidden="true" />
                      <span className="relative">{k.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          <div className="lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start lg:gap-8">
            {/* ═══ Palco do destaque ═══ */}
            <motion.section {...SECTION_MOTION} className="pt-[18px] lg:sticky lg:top-20" aria-label="Destaque">
              <div className="relative overflow-hidden rounded-[28px] bg-[#0b1b3a] p-[18px] text-white">
                <div
                  className="pointer-events-none absolute left-1/2 top-[30px] h-[320px] w-[320px] -translate-x-1/2 rounded-full transition-[background] duration-500"
                  style={{ background: `radial-gradient(circle, ${glow} 0%, rgba(11,27,58,0) 64%)` }}
                  aria-hidden="true"
                />

                <div className="relative flex items-center justify-between">
                  <span className="inline-flex h-[26px] items-center rounded-full bg-white/[0.12] px-2.5 text-[10px] font-extrabold tracking-[0.18em]">
                    DESTAQUE
                  </span>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    transition={spring.snappy}
                    onClick={() => toggleWishlist(hero.id)}
                    aria-pressed={fav}
                    aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
                  >
                    <Pop value={fav ? 1 : 0}>
                      <Heart className={`h-5 w-5 ${fav ? 'fill-rose-400 text-rose-400' : 'text-white'}`} />
                    </Pop>
                  </motion.button>
                </div>

                <div className="relative flex h-[236px] items-center justify-center">
                  {hero.image ? (
                    <img
                      src={hero.image}
                      alt={hero.name}
                      className="max-h-[222px] max-w-[80%] object-contain drop-shadow-[0_26px_30px_rgba(0,0,0,0.5)]"
                    />
                  ) : (
                    <ImageOff className="h-10 w-10 text-white/20" aria-hidden="true" />
                  )}
                </div>

                <div className="relative">
                  {hero.brand && (
                    <span className="block text-[10px] font-extrabold tracking-[0.2em] text-white/55 uppercase">{hero.brand}</span>
                  )}
                  <div className="mt-1 flex items-end justify-between gap-2.5">
                    <h2 className="text-2xl font-extrabold leading-[1.05] tracking-[-0.03em]">{hero.name}</h2>
                    {heroRating && heroRating.review_count > 0 && (
                      <span className="flex shrink-0 items-center gap-1 pb-0.5">
                        <Star className="h-[13px] w-[13px] text-amber-400 fill-amber-400" aria-hidden="true" />
                        <span className="text-xs font-bold">{heroRating.avg_rating.toFixed(1)}</span>
                        <span className="text-[11px] text-white/50">({heroRating.review_count})</span>
                      </span>
                    )}
                  </div>

                  {storages.length > 0 && (
                    <div className="mt-4">
                      <span className="block text-[11px] font-semibold text-white/60">Armazenamento</span>
                      <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Armazenamento">
                        {storages.map((s) => {
                          const on = s === storage;
                          return (
                            <motion.button
                              key={s}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              whileTap={{ scale: 0.95 }}
                              transition={spring.snappy}
                              onClick={() => setStorage(s)}
                              className={`h-11 flex-1 rounded-xl border text-[13px] font-bold transition-colors ${
                                on ? 'border-white bg-white text-[#0b1b3a]' : 'border-white/[0.16] bg-white/[0.06] text-white hover:bg-white/10'
                              }`}
                            >
                              {s}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {colors.length > 0 && (
                    <div className="mt-3.5">
                      <span className="block text-[11px] font-semibold text-white/60">
                        Cor · <span className="text-white">{color}</span>
                      </span>
                      <div className="mt-1.5 flex gap-1.5" role="radiogroup" aria-label="Cor">
                        {colors.map((c) => {
                          const on = c.name === color;
                          return (
                            <button
                              key={c.name}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              aria-label={c.name}
                              onClick={() => setColor(c.name)}
                              className={`h-11 w-11 rounded-full border-2 flex items-center justify-center transition-colors ${
                                on ? 'border-white' : 'border-transparent'
                              }`}
                            >
                              <span
                                className="block h-6 w-6 rounded-full border border-white/25"
                                style={{ backgroundColor: c.hex }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-3.5 flex items-end justify-between gap-2.5 border-t border-white/[0.12] pt-3.5">
                    <div>
                      <Pop value={hero.price}>
                        <span className="block text-[26px] font-extrabold leading-none tracking-[-0.03em]">{brl(hero.price)}</span>
                      </Pop>
                      <span className="mt-1.5 block text-[11px] text-white/60">em até 10× de {brl(hero.price / 10)} sem juros</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[15px] font-extrabold leading-none text-emerald-400">{brl(hero.price * 0.95)}</span>
                      <span className="mt-1.5 block text-[10px] font-bold text-emerald-400">no PIX · 5% OFF</span>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    transition={spring.snappy}
                    onClick={handleAdd}
                    disabled={hero.stock === 0}
                    className="mt-3.5 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-blue-600 text-[15px] font-bold text-white hover:bg-blue-700 transition-colors disabled:bg-white/20 disabled:text-white/50"
                  >
                    {hero.stock === 0 ? 'Esgotado' : 'Adicionar ao carrinho'}
                    {hero.stock > 0 && <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />}
                  </motion.button>
                  <Link
                    to={`/${ELECTRONICS.slug}/${hero.id}`}
                    onPointerEnter={preloadElectronicsPurchase}
                    className="mt-3 block text-center text-[11px] font-semibold text-white/60 hover:text-white transition-colors"
                  >
                    Ver ficha completa
                  </Link>
                </div>
              </div>
            </motion.section>

            <div>
              {/* ═══ Trilho ═══ */}
              {rail.length > 0 && (
                <motion.section {...SECTION_MOTION} className="pt-[26px] lg:pt-[18px]" aria-label={railTitle}>
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-xl font-extrabold tracking-[-0.03em] text-slate-900">{railTitle}</h2>
                    <Link
                      to="/produtos"
                      onPointerEnter={preloadProducts}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Ver todos <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                  <Stagger
                    key={kind}
                    gap={0.05}
                    className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 xl:grid-cols-3"
                  >
                    {rail.map((p, i) => (
                      <StaggerItem key={p.id} className="shrink-0 lg:shrink">
                        <RailCard product={p} tint={TINTS[i % TINTS.length]} rating={ratings?.[p.id]} />
                      </StaggerItem>
                    ))}
                  </Stagger>
                </motion.section>
              )}

              {/* ═══ Condições ═══ */}
              <motion.section {...SECTION_MOTION} className="pt-5 lg:pt-6" aria-label="Condições de compra">
                <ul className="grid grid-cols-2 gap-2.5">
                  {[
                    { Icon: Truck, t: 'Entrega rápida', d: 'Mesmo dia em Osasco' },
                    { Icon: Zap, t: '5% no PIX', d: 'Aprovação imediata' },
                    { Icon: CreditCard, t: '10× sem juros', d: 'No cartão' },
                    { Icon: ShieldCheck, t: 'Troca em 7 dias', d: 'Garantia pelo CDC' },
                  ].map(({ Icon, t, d }) => (
                    <li key={t} className="flex items-center gap-2.5 rounded-2xl border border-slate-200 px-3.5 py-3">
                      <Icon className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-slate-900">{t}</span>
                        <span className="block text-[10.5px] text-slate-500">{d}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Electronics;
