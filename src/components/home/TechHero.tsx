import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ImageOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { preloadProducts, preloadElectronics } from '@/lib/preloadRoutes';
import { easing, spring } from '@/lib/motion';
import { groupForCategory } from '@/lib/catalogGroups';

const AUTOPLAY_MS = 6000;
const SPOTLIGHT_MAX = 3;

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Rota do produto: a ficha própria da aba quando ela existe, senão a genérica. */
const productPath = (id: string, category: string) => {
  const g = groupForCategory(category);
  return g?.hasPurchasePage ? `/${g.slug}/${id}` : `/produto/${id}`;
};

/**
 * Hero da home no padrão Vitrine: título editorial à esquerda e, à direita,
 * os produtos em destaque se revezando como holofote. Nada de slide com
 * texto genérico — o que gira é o produto de verdade.
 */
export const TechHero: React.FC = () => {
  const { data: products } = useProducts();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const spotlight = useMemo(() => {
    if (!products?.length) return [];
    const withImage = products.filter((p) => p.image);
    const featured = withImage.filter((p) => p.is_featured);
    return (featured.length ? featured : withImage).slice(0, SPOTLIGHT_MAX);
  }, [products]);

  const go = useCallback(
    (i: number) => setActive(spotlight.length ? ((i % spotlight.length) + spotlight.length) % spotlight.length : 0),
    [spotlight.length],
  );

  // Autoplay: pausa no hover/foco e respeita quem prefere menos movimento.
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (paused || reduced || spotlight.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % spotlight.length), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, spotlight.length]);

  const current = spotlight[active] ?? spotlight[0];

  return (
    <section
      className="relative pt-4 sm:pt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-label="Destaques da loja"
    >
      <div className="relative mx-auto max-w-5xl px-4 sm:grid sm:grid-cols-2 sm:items-center sm:gap-8">
        <div
          className="pointer-events-none absolute -right-16 -top-8 h-[300px] w-[300px] rounded-full sm:right-0 sm:top-0 sm:h-[400px] sm:w-[400px]"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.26) 0%, rgba(255,255,255,0) 66%)' }}
          aria-hidden="true"
        />

        <div className="relative max-w-[224px] sm:max-w-none">
          <motion.span
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: easing.smooth }}
            className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.22em] text-blue-600"
          >
            <span className="block h-0.5 w-[18px] rounded bg-blue-600" aria-hidden="true" />
            NOVIDADES
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: easing.smooth }}
            className="mt-3 text-[38px] leading-[0.94] font-extrabold tracking-[-0.05em] text-slate-900 sm:text-[62px]"
          >
            <span className="block">Tecnologia</span>
            <span className="block">para o seu</span>
            <span
              className="block text-[48px] leading-[0.95] tracking-[-0.02em] text-blue-600 sm:text-[76px]"
              style={{ fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontWeight: 400 }}
            >
              dia a dia.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22, ease: easing.smooth }}
            className="mt-4 max-w-[200px] text-[13px] leading-relaxed text-slate-500 sm:max-w-sm sm:text-sm"
          >
            Acessórios e eletrônicos para o trabalho e o lazer. Pedidos até as 16h saem no mesmo dia em Osasco.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3, ease: easing.smooth }}
            className="mt-5 flex flex-wrap items-center gap-2.5"
          >
            <Link
              to="/produtos"
              onPointerEnter={preloadProducts}
              onTouchStart={preloadProducts}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
            >
              Comprar agora <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/eletronicos"
              onPointerEnter={preloadElectronics}
              onTouchStart={preloadElectronics}
              className="inline-flex h-11 items-center rounded-full px-3 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Ver eletrônicos
            </Link>
          </motion.div>
        </div>

        {/* Holofote: produto em destaque flutuando; no celular ele sobrepõe o título. */}
        <div className="pointer-events-none absolute right-0 top-3 h-[230px] w-[136px] sm:pointer-events-auto sm:relative sm:right-auto sm:top-auto sm:h-[400px] sm:w-auto">
          <div className="relative flex h-full items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              {current ? (
                <motion.img
                  key={current.id}
                  src={current.image}
                  alt=""
                  aria-hidden="true"
                  initial={{ opacity: 0, y: 24, rotate: -9 }}
                  animate={{ opacity: 1, y: [0, -10, 0], rotate: -9 }}
                  exit={{ opacity: 0, y: -16, rotate: -9 }}
                  transition={{ opacity: { duration: 0.45 }, y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 } }}
                  className="max-h-full max-w-full object-contain drop-shadow-[0_32px_36px_rgba(15,23,42,0.38)] sm:max-h-[340px] sm:max-w-[280px]"
                />
              ) : (
                <ImageOff className="h-10 w-10 text-slate-200" aria-hidden="true" />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Legenda do holofote: nome, preço e os pontinhos para trocar. */}
      {current && (
        <div className="mx-auto mt-3 flex max-w-5xl items-center justify-between gap-3 px-4 sm:-mt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: easing.smooth }}
            >
              <Link
                to={productPath(current.id, current.category)}
                className="inline-flex h-10 max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white pl-3.5 pr-3 text-xs font-semibold text-slate-900 shadow-sm hover:border-slate-400 transition-colors"
              >
                <span className="block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
                <span className="truncate">{current.name}</span>
                <span className="shrink-0 text-slate-400">·</span>
                <span className="shrink-0 font-extrabold">{brl(current.price)}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden="true" />
              </Link>
            </motion.div>
          </AnimatePresence>

          {spotlight.length > 1 && (
            <div className="flex shrink-0 items-center" role="tablist" aria-label="Produtos em destaque">
              {spotlight.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Destaque ${i + 1}: ${p.name}`}
                  onClick={() => go(i)}
                  className="group flex h-11 items-center px-1"
                >
                  <motion.span
                    animate={{ width: i === active ? 24 : 6 }}
                    transition={spring.snappy}
                    className={`block h-1.5 rounded-full ${i === active ? 'bg-blue-600' : 'bg-slate-300 group-hover:bg-slate-400'}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
