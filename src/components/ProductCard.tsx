import { preloadProductDetails } from '@/lib/preloadRoutes';
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Product } from '@/types/database';
import { useCart } from '@/contexts/CartContext';
import { useWishlist, saveWishlistPrice } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import { useProductRatings } from '@/hooks/useProductRatings';
import { cardHover, cardTap, easing } from '@/lib/motion';
import { Pop } from '@/components/animations/Pop';
import { Heart, ShoppingCart, Star, ImageOff } from 'lucide-react';

/** Produto sem foto: um bloco declarado, não um ícone perdido no vazio. */
export const SemFoto: React.FC = () => (
  <span className="flex h-[92px] w-[92px] flex-col items-center justify-center gap-1 rounded-2xl bg-white/70 text-slate-400">
    <ImageOff className="h-5 w-5" aria-hidden="true" />
    <span className="text-[10px] font-semibold">sem foto</span>
  </span>
);

/** Fundos do card, alternados pela posição no grid — mesmo jogo das abas. */
export const CARD_TINTS = ['bg-slate-100', 'bg-indigo-50', 'bg-sky-50', 'bg-violet-50'];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const ProductCardSkeleton = () => (
  <div className="rounded-[22px] bg-slate-100 p-3.5">
    <div className="h-[150px] rounded-xl skeleton" />
    <div className="mt-3 space-y-2">
      <div className="h-3 w-4/5 rounded skeleton" />
      <div className="h-3 w-1/2 rounded skeleton" />
      <div className="h-5 w-2/3 rounded skeleton" />
    </div>
  </div>
);

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
  className?: string;
  index?: number;
}

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ─── Card ─────────────────────────────────────────────────────────────────────
export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, className = '', index = 0 }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: ratings } = useProductRatings();

  const cardRef = useRef<HTMLElement>(null);
  const inView = useInView(cardRef, { once: true, amount: 0.15, margin: '-8% 0px' });

  const rating = ratings?.[product.id];
  const isFavorite = isInWishlist(product.id);
  const isOutOfStock = product.stock === 0;
  const isLowStock = !isOutOfStock && product.stock > 0 && product.stock <= 5;
  const tint = CARD_TINTS[index % CARD_TINTS.length];

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFavorite) saveWishlistPrice(product.id, product.price);
    toggleWishlist(product.id);
  };
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product);
    toast({ title: 'Adicionado ao carrinho', description: product.name });
  };
  const warmDetail = () => { preloadProductDetails(); };
  const handleNavigate = () => {
    if (onViewDetails) onViewDetails(product);
    else navigate(`/produto/${product.id}`);
  };

  // Entrada ao rolar: sobe e aparece, com atraso curto pela posição no grid.
  // MotionConfig no App zera os transforms sob prefers-reduced-motion.
  const entrance = {
    initial: { opacity: 0, y: 20 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.45, delay: Math.min(index * 0.04, 0.32), ease: easing.smooth },
  };

  return (
    <motion.article
      ref={cardRef as React.RefObject<HTMLDivElement>}
      role="link"
      tabIndex={0}
      aria-label={`Ver ${product.name}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNavigate(); } }}
      onClick={handleNavigate}
      onPointerEnter={warmDetail}
      onTouchStart={warmDetail}
      whileHover={cardHover}
      whileTap={cardTap}
      {...entrance}
      className={`group relative flex cursor-pointer flex-col rounded-[22px] p-3.5 ${tint} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${className}`}
    >
      {/* Etiquetas — derivadas do estoque e do destaque, nunca inventadas. */}
      {!isOutOfStock && (product.is_featured || isLowStock) && (
        <div className="absolute left-3.5 top-3.5 z-[3] flex flex-col items-start gap-1">
          {product.is_featured && (
            <span className="inline-flex h-[22px] items-center rounded-full bg-blue-600 px-2 text-[9px] font-extrabold tracking-[0.12em] text-white">
              MAIS VENDIDO
            </span>
          )}
          {isLowStock && (
            <span className="inline-flex h-[22px] items-center rounded-full bg-amber-500 px-2 text-[9px] font-extrabold tracking-[0.12em] text-white">
              ÚLTIMAS {product.stock}
            </span>
          )}
        </div>
      )}

      <button
        onClick={handleToggleWishlist}
        aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        aria-pressed={isFavorite}
        className="absolute right-2.5 top-2.5 z-[3] flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/70 active:scale-90"
      >
        <Pop value={String(isFavorite)} className="flex">
          <Heart className={`h-[18px] w-[18px] ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
        </Pop>
      </button>

      <div className="flex h-[150px] items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
            loading="lazy"
            className={`max-h-full max-w-[82%] object-contain drop-shadow-[0_14px_18px_rgba(15,23,42,0.18)] transition-transform duration-300 group-hover:scale-[1.04] ${
              isOutOfStock ? 'opacity-45 grayscale' : ''
            }`}
          />
        ) : (
          <SemFoto />
        )}
      </div>

      {/* Nomes reais do catálogo são longos ("Cordão do Telemóvel Cabo de Dados"):
          uma linha só truncava tudo em "Cordão do...". */}
      <h3 className="mt-2.5 line-clamp-2 min-h-[2.2rem] text-sm font-bold leading-tight tracking-[-0.01em] text-slate-900">
        {product.name}
      </h3>

      <span className="mt-0.5 flex min-h-[16px] items-center gap-1.5 text-[11px] text-slate-500">
        <span className="truncate">{product.brand || product.category}</span>
        {rating && rating.review_count > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <Star className="h-[10px] w-[10px] shrink-0 fill-amber-400 text-amber-400" aria-hidden="true" />
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
            {isOutOfStock ? 'Esgotado' : `10× de ${brl(product.price / 10)}`}
          </span>
        </span>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label={isOutOfStock ? `${product.name} esgotado` : `Adicionar ${product.name} ao carrinho`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition-all hover:bg-blue-600 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:active:scale-100"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
};
