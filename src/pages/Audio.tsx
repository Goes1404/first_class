import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Star, Quote, ImageOff,
  Truck, RefreshCw, Headphones, ShieldCheck,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Stagger, StaggerItem } from '@/components/animations/Stagger';
import { cardHover, cardTap, easing } from '@/lib/motion';

const MotionLink = motion(Link);
import { useProducts } from '@/hooks/useProducts';
import { useProductRatings } from '@/hooks/useProductRatings';
import { useProductTestimonials } from '@/hooks/useAudioTestimonials';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AUDIO } from '@/lib/catalogGroups';
import { preloadProducts } from '@/lib/preloadRoutes';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ─── Estrelas ─────────────────────────────────────────────────────────── */
const Stars: React.FC<{ value: number; className?: string }> = ({ value, className = 'h-3 w-3' }) => (
  <span className="flex items-center gap-0.5" aria-label={`${value.toFixed(1)} de 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`${className} ${i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-white/15'}`}
        aria-hidden="true"
      />
    ))}
  </span>
);

/* ─── Página ───────────────────────────────────────────────────────────── */
const Audio: React.FC = () => {
  const { usePageVisit } = useAnalytics();
  usePageVisit(AUDIO.analyticsKey);

  const { data: products, isLoading, isError } = useProducts();
  const { data: ratings } = useProductRatings();

  const items = useMemo(
    () => (products ?? []).filter((p) => AUDIO.matches(p.category)),
    [products],
  );

  const hero = useMemo(() => items.find((p) => p.is_featured) ?? items[0], [items]);
  const rest = useMemo(() => items.filter((p) => p.id !== hero?.id).slice(0, 4), [items, hero]);

  const { data: testimonials } = useProductTestimonials(items.map((p) => p.id));

  // Números agregados das avaliações reais deste recorte.
  const stats = useMemo(() => {
    if (!ratings) return null;
    const rows = items.map((p) => ratings[p.id]).filter((r) => r && r.review_count > 0);
    const reviews = rows.reduce((n, r) => n + r.review_count, 0);
    if (!reviews) return null;
    const weighted = rows.reduce((n, r) => n + r.avg_rating * r.review_count, 0) / reviews;
    return { avg: weighted, reviews, models: items.length };
  }, [items, ratings]);

  const heroSpecs = hero?.specs?.filter((s) => s.label && s.value) ?? [];
  const heroRating = hero ? ratings?.[hero.id] : undefined;
  const [word1, ...wordRest] = AUDIO.headline;

  return (
    <div className="min-h-screen bg-[#07070b] text-white pb-28">
      <SEO title={AUDIO.seoTitle} description={AUDIO.tagline} />

      {/* ═══ Topo ═══ */}
      <header className="sticky top-0 z-30 bg-[#07070b]/85 backdrop-blur border-b border-white/5">
        <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
          <Link to="/" aria-label="Voltar para a home" className="h-10 w-10 -ml-2 flex items-center text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-indigo-400" aria-hidden="true" />
            <span className="text-[11px] font-bold tracking-[0.28em] text-white/60 uppercase">Áudio</span>
          </span>
          <Link
            to="/produtos"
            onPointerEnter={preloadProducts}
            className="h-9 px-4 rounded-full border border-white/15 text-[11px] font-bold tracking-wider text-white/80 hover:border-indigo-400 hover:text-white transition-colors flex items-center"
          >
            VER TUDO
          </Link>
        </div>
      </header>

      {isLoading && (
        <div className="mx-auto max-w-5xl px-4 pt-8 space-y-4" aria-busy="true">
          <div className="h-8 w-2/3 rounded skeleton-dark" />
          <div className="aspect-[4/3] rounded-3xl skeleton-dark" />
          <div className="h-24 rounded-2xl skeleton-dark" />
        </div>
      )}

      {isError && (
        <p className="mx-auto max-w-5xl px-4 pt-10 text-center text-sm text-white/50">
          Não foi possível carregar os produtos agora. Atualize a página para tentar de novo.
        </p>
      )}

      {!isLoading && !isError && !hero && (
        <div className="mx-auto max-w-5xl px-4 pt-16 text-center">
          <Headphones className="mx-auto h-10 w-10 text-white/15" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-white/80">{AUDIO.emptyTitle}</p>
          <p className="mt-1 text-xs text-white/40">{AUDIO.emptyHint}</p>
          <Link to="/produtos" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400">
            Ver todos os produtos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {hero && (
        <>
          {/* ═══ Hero ═══ */}
          <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5, ease: easing.smooth }} className="relative overflow-hidden">
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-indigo-600/25 blur-[90px] pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-5xl px-4 pt-8">
              {hero.brand && (
                <span className="text-[10px] font-bold tracking-[0.3em] text-indigo-400 uppercase">
                  {hero.brand}
                </span>
              )}
              <h1 className="mt-2 text-[44px] leading-[0.92] font-bold tracking-[-0.04em]">
                {word1}
                <span className="block bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  {wordRest.join(' ')}
                </span>
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/45">{AUDIO.tagline}</p>

              {/* Produto em destaque sobre o pedestal */}
              <div className="relative mt-6 flex items-center justify-center">
                <motion.div
                  className="absolute bottom-3 h-10 w-52 rounded-[50%] bg-indigo-500/25 blur-2xl"
                  animate={{ opacity: [0.55, 1, 0.55], scaleX: [1, 1.12, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  aria-hidden="true"
                />
                <div
                  className="absolute bottom-4 h-28 w-56 rounded-[50%] border border-white/10"
                  aria-hidden="true"
                />
                {hero.image ? (
                  <motion.img
                    src={hero.image}
                    alt={hero.name}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative h-52 object-contain drop-shadow-[0_24px_40px_rgba(99,102,241,0.35)]"
                  />
                ) : (
                  <ImageOff className="relative h-12 w-12 text-white/15" aria-hidden="true" />
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-base font-bold">{hero.name}</p>
                  {heroRating && heroRating.review_count > 0 && (
                    <span className="mt-1.5 flex items-center gap-2">
                      <Stars value={heroRating.avg_rating} />
                      <span className="text-[11px] text-white/40">
                        {heroRating.avg_rating.toFixed(1)} · {heroRating.review_count} avaliações
                      </span>
                    </span>
                  )}
                </div>
                <span className="text-2xl font-bold tracking-[-0.02em]">{brl(hero.price)}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  to={`/produto/${hero.id}`}
                  className="h-12 px-6 rounded-full bg-white text-[#07070b] text-sm font-bold flex items-center gap-2 hover:bg-white/90 transition-colors"
                >
                  Comprar agora <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/produtos"
                  onPointerEnter={preloadProducts}
                  className="h-12 px-6 rounded-full border border-white/15 text-sm font-bold text-white/85 flex items-center hover:border-white/40 transition-colors"
                >
                  Ver a linha
                </Link>
              </div>

              {/* Cores disponíveis */}
              {(hero.colors?.length ?? 0) > 0 && (
                <div className="mt-5 flex items-center gap-2.5">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">Cores</span>
                  {hero.colors!.map((c) => (
                    <span
                      key={c.name}
                      title={c.name}
                      className="h-6 w-6 rounded-full border border-white/20"
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.section>

          {/* ═══ Ficha técnica ═══ */}
          {heroSpecs.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5, ease: easing.smooth }} className="mx-auto max-w-5xl px-4 pt-9">
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="bg-white/[0.04] px-4 py-2.5 border-b border-white/10">
                  <span className="text-[10px] font-bold tracking-[0.28em] text-white/50 uppercase">
                    Ficha técnica
                  </span>
                </div>
                <dl className="grid grid-cols-2 sm:grid-cols-3">
                  {heroSpecs.map((s) => (
                    <div key={s.label} className="px-4 py-3.5 border-b border-r border-white/5">
                      <dt className="text-[10px] font-bold tracking-[0.16em] text-white/35 uppercase">
                        {s.label}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-white/90">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </motion.section>
          )}

          {/* ═══ Vitrine ═══ */}
          {rest.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5, ease: easing.smooth }} className="mx-auto max-w-5xl px-4 pt-10">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-bold">Descubra a linha</h2>
                <Link
                  to="/produtos"
                  onPointerEnter={preloadProducts}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Ver todos <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <Stagger className="mt-4 grid grid-cols-2 gap-3">
                {rest.map((p) => {
                  const r = ratings?.[p.id];
                  return (
                    <StaggerItem key={p.id}>
                    <MotionLink
                      whileHover={cardHover}
                      whileTap={cardTap}
                      to={`/produto/${p.id}`}
                      className="group rounded-2xl border border-white/8 bg-white/[0.03] p-3 hover:border-indigo-400/50 transition-colors"
                    >
                      <div className="aspect-square rounded-xl bg-white/[0.03] flex items-center justify-center overflow-hidden">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            loading="lazy"
                            className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <ImageOff className="h-7 w-7 text-white/15" aria-hidden="true" />
                        )}
                      </div>
                      <p className="mt-2.5 text-[13px] font-semibold leading-snug line-clamp-2 min-h-[2.4rem]">
                        {p.name}
                      </p>
                      {r && r.review_count > 0 ? (
                        <Stars value={r.avg_rating} className="h-2.5 w-2.5" />
                      ) : (
                        <span className="block text-[10px] text-white/25">Sem avaliações ainda</span>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-bold">{brl(p.price)}</span>
                        <span className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </MotionLink>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </motion.section>
          )}

          {/* ═══ Números reais ═══ */}
          {stats && (
            <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5, ease: easing.smooth }} className="mx-auto max-w-5xl px-4 pt-10">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] grid grid-cols-3 divide-x divide-white/10">
                {[
                  { v: stats.avg.toFixed(1).replace('.', ',') + '/5', l: 'Nota média' },
                  { v: String(stats.reviews), l: stats.reviews === 1 ? 'Avaliação' : 'Avaliações' },
                  { v: String(stats.models), l: stats.models === 1 ? 'Modelo' : 'Modelos' },
                ].map((s) => (
                  <div key={s.l} className="px-3 py-4 text-center">
                    <span className="block text-xl font-bold">{s.v}</span>
                    <span className="mt-0.5 block text-[10px] tracking-wider text-white/35 uppercase">{s.l}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ═══ Depoimentos reais ═══ */}
          {testimonials && testimonials.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5, ease: easing.smooth }} className="mx-auto max-w-5xl px-4 pt-10">
              <h2 className="text-lg font-bold">Quem já comprou</h2>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {testimonials.map((t) => (
                  <figure
                    key={t.id}
                    className="w-[270px] shrink-0 rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                  >
                    <Quote className="h-4 w-4 text-indigo-400" aria-hidden="true" />
                    <blockquote className="mt-2 text-[13px] leading-relaxed text-white/70 line-clamp-4">
                      {t.comment}
                    </blockquote>
                    <figcaption className="mt-3 flex items-center gap-2.5 border-t border-white/5 pt-3">
                      {t.avatar ? (
                        <img src={t.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <span className="h-8 w-8 rounded-full bg-white/8 flex items-center justify-center text-[11px] font-bold text-white/60">
                          {t.author.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold truncate">{t.author}</span>
                        {t.productName && (
                          <span className="block text-[10px] text-white/30 truncate">{t.productName}</span>
                        )}
                      </span>
                      <Stars value={t.rating} className="h-2.5 w-2.5 ml-auto" />
                    </figcaption>
                  </figure>
                ))}
              </div>
            </motion.section>
          )}

          {/* ═══ Garantias da loja ═══ */}
          <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5, ease: easing.smooth }} className="mx-auto max-w-5xl px-4 pt-10">
            <ul className="grid grid-cols-3 gap-3">
              {[
                { Icon: Truck, t: 'Entrega rápida', d: 'Mesmo dia em Osasco' },
                { Icon: RefreshCw, t: 'Troca em 7 dias', d: 'Garantia pelo CDC' },
                { Icon: ShieldCheck, t: 'Compra segura', d: 'PIX e cartão' },
              ].map(({ Icon, t, d }) => (
                <li key={t} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-center">
                  <Icon className="mx-auto h-4 w-4 text-indigo-400" aria-hidden="true" />
                  <span className="mt-1.5 block text-[11px] font-bold leading-tight">{t}</span>
                  <span className="mt-0.5 block text-[10px] leading-tight text-white/35">{d}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        </>
      )}
    </div>
  );
};

export default Audio;
