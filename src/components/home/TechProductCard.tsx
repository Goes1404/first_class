import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, ImageOff } from 'lucide-react';
import { Product } from '@/types/database';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { preloadProductDetails } from '@/lib/preloadRoutes';
import { BADGE_STYLES, type BadgeKind } from './techTheme';

const BADGE_LABEL: Record<BadgeKind, string> = {
  bestseller: 'MAIS VENDIDO',
  trending: 'EM ALTA',
  popular: 'POPULAR',
  last: 'ÚLTIMAS UNIDADES',
};

interface Props {
  product: Product;
  /** Avaliação agregada; omitida quando o produto ainda não tem avaliações. */
  rating?: { avg_rating: number; review_count: number };
  badge?: BadgeKind;
}

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const TechProductCardSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-white border border-slate-200 p-3">
    <div className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
    <div className="mt-3 space-y-2">
      <div className="h-3 w-4/5 rounded bg-slate-100 animate-pulse" />
      <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
      <div className="h-5 w-2/3 rounded bg-slate-100 animate-pulse" />
    </div>
  </div>
);

export const TechProductCard: React.FC<Props> = ({ product, rating, badge }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const outOfStock = product.stock === 0;

  const handleAdd = (e: React.MouseEvent) => {
    // O card inteiro é um link — o clique no botão não deve navegar.
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({ title: 'Adicionado ao carrinho', description: product.name });
  };

  return (
    <Link
      to={`/produto/${product.id}`}
      onPointerEnter={() => preloadProductDetails()}
      onTouchStart={() => preloadProductDetails()}
      className="group relative flex flex-col rounded-2xl bg-white border border-slate-200 p-3 hover:border-blue-300 hover:shadow-lg transition-all"
    >
      {badge && (
        <span
          className={`absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide ${BADGE_STYLES[badge]}`}
        >
          {BADGE_LABEL[badge]}
        </span>
      )}

      <div className="aspect-square rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ImageOff className="h-8 w-8 text-slate-300" aria-hidden="true" />
        )}
      </div>

      <h3 className="mt-3 text-sm font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem]">
        {product.name}
      </h3>

      {/* Só mostramos a nota quando ela existe de verdade. */}
      {rating && rating.review_count > 0 ? (
        <span className="mt-1.5 flex items-center gap-1 text-[11px]">
          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
          <span className="font-semibold text-slate-700">{rating.avg_rating.toFixed(1)}</span>
          <span className="text-slate-400">({rating.review_count})</span>
        </span>
      ) : (
        <span className="mt-1.5 text-[11px] text-slate-400">Sem avaliações ainda</span>
      )}

      <div className="mt-auto pt-3 flex items-end justify-between gap-2">
        <span className="text-base font-extrabold text-slate-900">{brl(product.price)}</span>
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          aria-label={outOfStock ? `${product.name} esgotado` : `Adicionar ${product.name} ao carrinho`}
          className="h-9 w-9 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:active:scale-100 transition-all"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>

      {outOfStock && (
        <span className="mt-1 text-[10px] font-semibold text-slate-400">Esgotado</span>
      )}
    </Link>
  );
};
