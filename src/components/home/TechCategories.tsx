import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ImageOff, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { Stagger, StaggerItem } from '@/components/animations/Stagger';
import { cardHover, cardTap } from '@/lib/motion';
import { ELECTRONICS, SNEAKERS, APPAREL, AUDIO, groupForCategory, type CollectionGroup } from '@/lib/catalogGroups';
import { preloadProducts } from '@/lib/preloadRoutes';

const MotionLink = motion(Link);

/** Abas com página própria, na ordem da vitrine, cada uma com o seu fundo. */
const GROUPS: Array<{ group: CollectionGroup; tint: string }> = [
  { group: ELECTRONICS, tint: 'bg-indigo-50' },
  { group: SNEAKERS, tint: 'bg-sky-50' },
  { group: APPAREL, tint: 'bg-rose-50' },
  { group: AUDIO, tint: 'bg-slate-100' },
];

const SKELETON_COUNT = 4;

/**
 * Coleções da home: um tile por aba que tem produto, com a foto do destaque
 * daquela aba. Categorias soltas (sem aba) viram balões abaixo, apontando
 * para a listagem filtrada.
 */
export const TechCategories: React.FC = () => {
  const { data: products, isLoading } = useProducts();

  const tiles = React.useMemo(() => {
    if (!products?.length) return [];
    return GROUPS.map(({ group, tint }) => {
      const items = products.filter((p) => group.matches(p.category));
      const cover = items.find((p) => p.is_featured && p.image) ?? items.find((p) => p.image);
      return { group, tint, count: items.length, cover: cover?.image };
    }).filter((t) => t.count > 0);
  }, [products]);

  // Categorias reais sem aba dedicada, das mais cheias para as mais vazias.
  const loose = React.useMemo(() => {
    if (!products?.length) return [];
    const counts = new Map<string, number>();
    for (const p of products) {
      if (!p.category || groupForCategory(p.category)) continue;
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name]) => name);
  }, [products]);

  if (isLoading) {
    return (
      <section className="pt-8" aria-label="Coleções" aria-busy="true">
        <div className="mx-auto max-w-5xl px-4 flex gap-3 overflow-hidden">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="h-[176px] w-[150px] shrink-0 rounded-[22px] skeleton sm:flex-1" />
          ))}
        </div>
      </section>
    );
  }

  if (!tiles.length && !loose.length) return null;

  return (
    <section className="pt-8" aria-label="Coleções">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-extrabold tracking-[-0.03em] text-slate-900">Coleções</h2>
          <Link
            to="/produtos"
            onPointerEnter={preloadProducts}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Ver tudo <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {tiles.length > 0 && (
          <Stagger
            gap={0.06}
            className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0"
          >
            {tiles.map(({ group, tint, count, cover }) => (
              <StaggerItem key={group.slug} kind="scale" className="shrink-0 snap-start sm:shrink">
                <MotionLink
                  whileHover={cardHover}
                  whileTap={cardTap}
                  to={`/${group.slug}`}
                  className={`group block w-[150px] rounded-[22px] p-3.5 ${tint} sm:w-auto`}
                >
                  <div className="flex h-[96px] items-center justify-center">
                    {cover ? (
                      <img
                        src={cover}
                        alt=""
                        loading="lazy"
                        className="max-h-full max-w-[80%] object-contain drop-shadow-[0_12px_16px_rgba(15,23,42,0.18)] group-hover:scale-[1.05] transition-transform duration-300"
                      />
                    ) : (
                      <ImageOff className="h-6 w-6 text-slate-300" aria-hidden="true" />
                    )}
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900 tracking-[-0.01em]">{group.title}</span>
                      <span className="block text-[11px] text-slate-500">
                        {count} {count === 1 ? 'produto' : 'produtos'}
                      </span>
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </MotionLink>
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {loose.length > 0 && (
          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:px-0">
            {loose.map((name) => (
              <Link
                key={name}
                to={`/produtos?category=${encodeURIComponent(name)}`}
                onPointerEnter={preloadProducts}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:border-slate-400 transition-colors"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                {name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
