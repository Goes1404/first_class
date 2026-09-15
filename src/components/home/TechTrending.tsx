import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PackageSearch } from 'lucide-react';
import { Product } from '@/types/database';
import { useProducts } from '@/hooks/useProducts';
import { useProductRatings } from '@/hooks/useProductRatings';
import { preloadProducts } from '@/lib/preloadRoutes';
import { TechProductCard, TechProductCardSkeleton } from './TechProductCard';
import { Stagger, StaggerItem } from '@/components/animations/Stagger';
import type { BadgeKind } from './techTheme';

const LIMIT = 6;

/** Etiqueta derivada dos dados reais do produto — nada é inventado.
 *  A ordem importa: estoque baixo avisa antes de qualquer selo de vitrine. */
const badgeFor = (p: Product, rank: number): BadgeKind | undefined => {
  if (p.stock > 0 && p.stock <= 5) return 'last';
  if (p.is_featured) return 'bestseller';
  if (rank === 0) return 'trending';
  if (rank === 1) return 'popular';
  return undefined;
};

export const TechTrending: React.FC = () => {
  const { data: products, isLoading, isError } = useProducts();
  const { data: ratings } = useProductRatings();

  // Em destaque primeiro, depois o resto — mantendo a ordem vinda do serviço.
  const shown = React.useMemo(() => {
    if (!products) return [];
    return [...products]
      .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
      .slice(0, LIMIT);
  }, [products]);

  return (
    <section className="pt-8" aria-labelledby="trending-title">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 id="trending-title" className="text-lg font-extrabold text-slate-900">
            Em alta na loja
          </h2>
          <Link
            to="/produtos"
            onPointerEnter={preloadProducts}
            onTouchStart={preloadProducts}
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3" aria-busy="true">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <TechProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Falha de rede não pode virar uma seção vazia e silenciosa. */}
        {isError && (
          <p className="rounded-2xl bg-white border border-slate-200 p-6 text-sm text-slate-500 text-center">
            Não foi possível carregar os produtos agora. Atualize a página para tentar de novo.
          </p>
        )}

        {!isLoading && !isError && shown.length === 0 && (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 flex flex-col items-center text-center gap-2">
            <PackageSearch className="h-8 w-8 text-slate-300" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-700">Nenhum produto publicado ainda</p>
            <p className="text-xs text-slate-500">Assim que o catálogo for preenchido, ele aparece aqui.</p>
          </div>
        )}

        {shown.length > 0 && (
          <Stagger className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {shown.map((p, i) => (
              <StaggerItem key={p.id}>
                <TechProductCard product={p} rating={ratings?.[p.id]} badge={badgeFor(p, i)} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
};
