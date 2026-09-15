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
import { Heart, ShoppingCart, Zap, Star, ImageOff } from 'lucide-react';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export const ProductCardSkeleton = () => (
  <div className="rounded-2xl bg-white border border-slate-200 p-3">
    <div className="aspect-square rounded-xl skeleton" />
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

// ─── Avaliação compacta (dado real) ────────────────────────────────────────────
const RatingInline: React.FC<{ avg: number; count: number }> = ({ avg, count }) => (
  <span className="flex items-center gap-1 text-[11px]">
    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
    <span className="font-semibold text-slate-700">{avg.toFixed(1)}</span>
    <span className="text-slate-400">({count})</span>
  </span>
);

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
  const isBentoLarge = className.includes('xl:col-span-2') || className.includes('md:col-span-2');

  const installment = brl(product.price / 10);
  // Mesmo desconto prometido na home e aplicado no checkout (5% OFF no PIX)
  const pixPrice = brl(product.price * 0.95);

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

  const cardBase =
    'group relative overflow-hidden rounded-2xl bg-white border border-slate-200 cursor-pointer transition-[border-color,box-shadow] duration-300 hover:border-blue-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2';

  const heartBtn = (size: string) => (
    <button
      onClick={handleToggleWishlist}
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      aria-pressed={isFavorite}
      className={`absolute top-2 right-2 z-[3] ${size} rounded-full bg-white/90 backdrop-blur shadow-sm border border-slate-200 flex items-center justify-center hover:border-rose-200 active:scale-90 transition-all`}
    >
      <Pop value={String(isFavorite)} className="flex">
        <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-600 fill-rose-600' : 'text-slate-500'}`} />
      </Pop>
    </button>
  );

  const badges = (!isOutOfStock && (product.is_featured || isLowStock)) && (
    <div className="absolute top-2 left-2 z-[3] flex flex-col items-start gap-1">
      {product.is_featured && (
        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-bold tracking-wide">
          MAIS VENDIDO
        </span>
      )}
      {isLowStock && (
        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-bold tracking-wide flex items-center gap-1">
          <Zap className="w-2.5 h-2.5" aria-hidden="true" />
          ÚLTIMAS {product.stock}
        </span>
      )}
    </div>
  );

  const soldOut = isOutOfStock && (
    <div className="absolute inset-0 z-[4] bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
      <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-500">
        Esgotado
      </span>
    </div>
  );

  const image = (cls: string) =>
    product.image ? (
      <img
        src={product.image}
        alt={product.name}
        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
        loading="lazy"
        className={`${cls} transition-transform duration-500 ease-out group-hover:scale-105`}
      />
    ) : (
      <ImageOff className="h-8 w-8 text-slate-300" aria-hidden="true" />
    );

  const addBtn = (cls: string) => (
    <button
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      aria-label={isOutOfStock ? `${product.name} esgotado` : `Adicionar ${product.name} ao carrinho`}
      className={`${cls} rounded-full flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:active:scale-100 transition-all`}
    >
      <ShoppingCart className="w-4 h-4" />
    </button>
  );

  // ── Card largo (destaque no topo do grid) ───────────────────────────────────
  if (isBentoLarge) {
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
        className={`${cardBase} grid grid-cols-1 sm:grid-cols-2 ${className}`}
      >
        <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[260px] bg-slate-50 flex items-center justify-center overflow-hidden">
          {image('h-full w-full object-contain p-6')}
          {badges}
          {heartBtn('h-11 w-11')}
          {soldOut}
        </div>

        <div className="p-4 sm:p-5 flex flex-col">
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
            {product.category || 'Destaque'}
          </span>
          <h3 className="mt-1 text-lg font-bold text-slate-900 leading-snug line-clamp-2">{product.name}</h3>
          {rating && rating.review_count > 0 ? (
            <div className="mt-1.5"><RatingInline avg={rating.avg_rating} count={rating.review_count} /></div>
          ) : (
            <span className="mt-1.5 text-[11px] text-slate-400">Sem avaliações ainda</span>
          )}
          {product.description && (
            <p className="mt-2 text-sm text-slate-500 line-clamp-2">{product.description}</p>
          )}
          <div className="mt-auto pt-4 flex items-end justify-between gap-3">
            <div>
              <span className="block text-2xl font-bold text-slate-900 tracking-[-0.02em]">{brl(product.price)}</span>
              <span className="block text-[11px] font-semibold text-emerald-600">{pixPrice} no PIX</span>
              <span className="block text-[11px] text-slate-400">10× de {installment}</span>
            </div>
            {addBtn('h-11 w-11')}
          </div>
        </div>
      </motion.article>
    );
  }

  // ── Card padrão ─────────────────────────────────────────────────────────────
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
      className={`${cardBase} flex flex-col ${className}`}
    >
      <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
        {image('h-full w-full object-contain p-4')}
        {badges}
        {heartBtn('h-10 w-10')}
        {soldOut}
      </div>

      <div className="p-3 flex-1 flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        {rating && rating.review_count > 0 ? (
          <RatingInline avg={rating.avg_rating} count={rating.review_count} />
        ) : (
          <span className="text-[11px] text-slate-400">Sem avaliações ainda</span>
        )}
        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <span className="block text-base font-extrabold text-slate-900">{brl(product.price)}</span>
            <span className="block text-[10px] font-semibold text-emerald-600">{pixPrice} no PIX</span>
            <span className="block text-[10px] text-slate-400">10× de {installment}</span>
          </div>
          {addBtn('h-9 w-9 shrink-0')}
        </div>
      </div>
    </motion.article>
  );
};
