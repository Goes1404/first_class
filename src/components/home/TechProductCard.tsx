import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, ImageOff } from 'lucide-react';
import { cardHover, cardTap } from '@/lib/motion';
import { Product } from '@/types/database';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { preloadProductDetails } from '@/lib/preloadRoutes';
import { BADGE_STYLES, type BadgeKind } from './techTheme';

const MotionLink = motion(Link);

const BADGE_LABEL: Record<BadgeKind, string> = {
  bestseller: 'MAIS VENDIDO',
  trending: 'EM ALTA',
  popular: 'POPULAR',
  last: 'ÚLTIMAS UNIDADES',
};

/* Fundos dos cards: um tom suave por posição, como na vitrine de eletrônicos. */
export const CARD_TINTS = ['bg-slate-100', 'bg-indigo-50', 'bg-sky-50', 'bg-violet-50'];

interface Props {
  product: Product;
  /** Avaliação agregada; omitida quando o produto ainda não tem avaliações. */
  rating?: { avg_rating: number; review_count: number };
  badge?: BadgeKind;
  /** Classe de fundo do card. */
  tint?: string;
}

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const TechProductCardSkeleton: React.FC = () => (
  <div className="rounded-[22px] bg-slate-100 p-3.5">
    <div className="h-[150px] rounded-xl skeleton" />
    <div className="mt-3 space-y-2">
      <div className="h-3 w-4/5 rounded skeleton" />
      <div className="h-3 w-1/2 rounded skeleton" />
      <div className="h-5 w-2/3 rounded skeleton" />
    </div>
  </div>
);

export const TechProductCard: React.FC<Props> = ({ product, rating, badge, tint = CARD_TINTS[0] }) => {
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
    <MotionLink
      whileHover={cardHover}
      whileTap={cardTap}
      to={`/produto/${product.id}`}
      onPointerEnter={() => preloadProductDetails()}
      onTouchStart={() => preloadProductDetails()}
      className={`group relative flex flex-col rounded-[22px] p-3.5 ${tint}`}
    >
      {badge && (
        <span
          className={`absolute left-3.5 top-3.5 z-10 inline-flex h-[22px] items-center rounded-full px-2 text-[9px] font-extrabold tracking-[0.12em] ${BADGE_STYLES[badge]}`}
        >
          {BADGE_LABEL[badge]}
        </span>
      )}

      <div className="flex h-[150px] items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="max-h-full max-w-[82%] object-contain drop-shadow-[0_14px_18px_rgba(15,23,42,0.18)] group-hover:scale-[1.04] transition-transform duration-300"
          />
        ) : (
          <ImageOff className="h-8 w-8 text-slate-300" aria-hidden="true" />
        )}
      </div>

      <h3 className="mt-2.5 text-sm font-bold leading-tight tracking-[-0.01em] text-slate-900 line-clamp-1">
        {product.name}
      </h3>

      <span className="mt-0.5 flex min-h-[16px] items-center gap-1.5 text-[11px] text-slate-500">
        <span className="truncate">{product.brand || product.category}</span>
        {rating && rating.review_count > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <Star className="h-[10px] w-[10px] shrink-0 text-amber-400 fill-amber-400" aria-hidden="true" />
            <span className="font-semibold text-slate-700">{rating.avg_rating.toFixed(1)}</span>
          </>
        )}
      </span>

      <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
        <span className="min-w-0">
          <span className="block whitespace-nowrap text-base font-extrabold tracking-[-0.02em] text-slate-900">
            {brl(product.price)}
          </span>
          <span className="block whitespace-nowrap text-[10.5px] text-slate-400">
            {outOfStock ? 'Esgotado' : `10× de ${brl(product.price / 10)}`}
          </span>
        </span>
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          aria-label={outOfStock ? `${product.name} esgotado` : `Adicionar ${product.name} ao carrinho`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-blue-600 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:active:scale-100 transition-all"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
    </MotionLink>
  );
};
