import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Heart, Share2, ShoppingBag, MessageCircle, Shield,
  RefreshCw, Truck, FileText, Star, Zap, Minus, Plus,
  CheckCircle2, Package, BadgeCheck, ChevronLeft, ChevronRight, ImageOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShippingCalculator } from '@/components/ShippingCalculator';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { ProductReviews } from '@/components/ProductReviews';
import { Reveal } from '@/components/animations/Reveal';
import { Pop } from '@/components/animations/Pop';
import { useCart } from '@/contexts/CartContext';
import { useWishlist, saveWishlistPrice } from '@/contexts/WishlistContext';
import { groupForCategory } from '@/lib/catalogGroups';
import { spring, easing } from '@/lib/motion';
import { useToast } from '@/hooks/use-toast';
import { useProduct, useAppSettings } from '@/hooks/useProducts';
import { useProductRatings } from '@/hooks/useProductRatings';
import { useAnalytics } from '@/hooks/useAnalytics';
import { SmartShowcase } from '@/components/SmartShowcase';
import { WHATSAPP_LINK } from '@/config/constants';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-24 pb-32" aria-busy="true">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-3">
            <div className="aspect-square rounded-3xl skeleton" />
            <div className="flex gap-2">
              {[0, 1, 2, 3].map(i => <div key={i} className="w-16 h-16 rounded-xl skeleton" />)}
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <div className="h-3 w-24 rounded skeleton" />
            <div className="h-8 w-4/5 rounded skeleton" />
            <div className="h-24 rounded-2xl skeleton" />
            <div className="h-14 rounded-full skeleton" />
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Galeria com swipe ────────────────────────────────────────────────────────
function Gallery({
  images,
  productName,
  isOutOfStock,
  isLowStock,
  stock,
  isFeatured,
}: {
  images: string[];
  productName: string;
  isOutOfStock: boolean;
  isLowStock: boolean;
  stock: number;
  isFeatured: boolean;
}) {
  const [active, setActive] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const dragStartX = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  const goTo = (i: number) => setActive(Math.max(0, Math.min(images.length - 1, i)));
  const prev = () => goTo(active - 1);
  const next = () => goTo(active + 1);

  // Swipe no toque
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    dragStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - dragStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx)) return; // rolagem vertical — não interfere
    e.preventDefault();
    setDragOffset(dx);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    setDragOffset(0);
    if (Math.abs(dx) > 48) {
      if (dx > 0) next();
      else prev();
    }
  };

  // Arrasto com mouse (desktop)
  const mouseStartX = useRef(0);
  const onMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    dragStartX.current = e.clientX;
    setIsDragging(true);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - dragStartX.current);
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const dx = mouseStartX.current - e.clientX;
    setDragOffset(0);
    if (Math.abs(dx) > 48) {
      if (dx > 0) next();
      else prev();
    }
  };

  const arrowBtn =
    'hidden lg:flex absolute top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 backdrop-blur shadow border border-slate-200 items-center justify-center text-slate-700 hover:border-blue-300 transition-all disabled:opacity-30';

  return (
    <div className="relative space-y-3 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: easing.smooth }}
        className="group relative overflow-hidden rounded-2xl lg:rounded-3xl bg-slate-50 border border-slate-200 cursor-grab active:cursor-grabbing"
        style={{ aspectRatio: '1 / 1' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => { if (isDragging) { setIsDragging(false); setDragOffset(0); } }}
      >
        <div
          className="flex h-full"
          style={{
            width: `${images.length * 100}%`,
            transform: `translateX(calc(-${active * (100 / images.length)}% + ${dragOffset / images.length}px))`,
            transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="flex items-center justify-center p-8 lg:p-12"
              style={{ width: `${100 / images.length}%`, flexShrink: 0 }}
            >
              <img
                src={src}
                alt={`${productName} — ${i + 1}`}
                onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
                className="w-full h-full object-contain pointer-events-none drop-shadow-xl"
              />
            </div>
          ))}
        </div>

        {/* Selos */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {isFeatured && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-bold tracking-wide">
              <BadgeCheck className="w-3 h-3" aria-hidden="true" /> MAIS VENDIDO
            </span>
          )}
          {isLowStock && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-bold tracking-wide">
              <Zap className="w-3 h-3" aria-hidden="true" /> ÚLTIMAS {stock}
            </span>
          )}
        </div>

        {images.length > 1 && (
          <>
            <button onClick={prev} disabled={active === 0} aria-label="Imagem anterior" className={`${arrowBtn} left-3`}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} disabled={active === images.length - 1} aria-label="Próxima imagem" className={`${arrowBtn} right-3`}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div aria-hidden="true" className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-300'}`}
              />
            ))}
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <span className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-500">
              Esgotado
            </span>
          </div>
        )}
      </motion.div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              whileTap={{ scale: 0.94 }}
              transition={spring.snappy}
              aria-label={`Imagem ${i + 1}`}
              aria-pressed={i === active}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border-2 transition-colors ${
                i === active ? 'border-blue-600' : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
              }`}
            >
              <img
                src={img}
                alt=""
                onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
                loading="lazy"
                draggable={false}
                className="w-full h-full object-contain p-1.5"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'descricao' | 'especificacoes' | 'frete'>('descricao');

  const { trackProductView } = useAnalytics();
  const { data: product, isLoading } = useProduct(id!);
  const { data: settings } = useAppSettings();
  const { data: ratings } = useProductRatings();

  useEffect(() => {
    // Calçado e roupa redirecionam para a tela de compra própria, que registra
    // a visualização lá — contar aqui também duplicaria a métrica.
    if (product?.id && !groupForCategory(product.category)?.hasPurchasePage) trackProductView(product.id);
  }, [product?.id, product?.category, trackProductView]);

  if (isLoading) return <LoadingSkeleton />;

  // Links antigos de /produto/<id> de calçado ou roupa caem na tela de compra.
  const group = product && groupForCategory(product.category);
  if (product && group?.hasPurchasePage) {
    return <Navigate to={`/${group.slug}/${product.id}`} replace />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Header />
        <main className="max-w-screen-xl mx-auto px-4 pt-32 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Produto não encontrado</h1>
          <p className="text-slate-500 mb-8 text-sm max-w-sm mx-auto">Este item pode ter sido removido do catálogo.</p>
          <Button onClick={() => navigate('/produtos')} className="h-11 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            Ver produtos
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const allImages = product.images?.length ? product.images : [product.image || '/placeholder.svg'];
  const isOutOfStock = product.stock === 0;
  const isLowStock = !isOutOfStock && product.stock <= 5;
  const maxQty = Math.min(product.stock, 10);
  const pixPrice = product.price * 0.95;
  const installment = brl(product.price / 10);
  const fav = isInWishlist(product.id);

  // Avaliação real (agregado das reviews); sem avaliações, convida a ser o primeiro.
  const productRating = ratings?.[product.id];
  const hasReviews = !!productRating && productRating.review_count > 0;

  // Frete grátis: barra de progresso para incentivar a compra.
  const freeShippingThreshold = Number(settings?.free_shipping_threshold) || 500;
  const subtotalForShipping = product.price * qty;
  const qualifiesFreeShipping = subtotalForShipping >= freeShippingThreshold;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotalForShipping);
  const freeShippingProgress = Math.min((subtotalForShipping / freeShippingThreshold) * 100, 100);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    toast({ title: qty > 1 ? `${qty} itens adicionados` : 'Adicionado ao carrinho', description: product.name });
  };
  const handleBuyNow = () => { handleAddToCart(); navigate('/checkout'); };
  const handleWishlist = () => {
    if (!fav) saveWishlistPrice(product.id, product.price);
    toggleWishlist(product.id);
  };
  const handleWhatsApp = () => {
    const number = settings?.whatsapp_number ?? WHATSAPP_LINK.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá! Tenho interesse em: ${product.name} (${brl(product.price)})`);
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copiado!' });
    }
  };

  const iconBtn =
    'h-11 w-11 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:border-slate-400 active:scale-95 transition-all';

  const tabs = [
    { key: 'descricao', label: 'Descrição' },
    { key: 'especificacoes', label: 'Especificações' },
    { key: 'frete', label: 'Frete' },
  ] as const;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEO
        title={product.name}
        description={product.description}
        image={product.image}
        type="product"
        product={{
          name: product.name,
          description: product.description,
          image: product.image,
          price: product.price,
          availability: isOutOfStock ? 'OutOfStock' : 'InStock',
        }}
      />
      <Header />

      <main id="conteudo" tabIndex={-1} className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-20 pb-40 lg:pt-28 lg:pb-24">
        {/* ── Voltar · trilha · favoritar/compartilhar ── */}
        <div className="relative flex items-center justify-between mb-5 lg:mb-8">
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="flex items-center gap-2 h-11 pr-2 text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-sm font-semibold hidden sm:inline">Voltar</span>
          </button>

          <nav aria-label="Trilha" className="hidden lg:flex items-center gap-2 text-xs text-slate-400 absolute left-1/2 -translate-x-1/2">
            <Link to="/produtos" className="hover:text-blue-600 transition-colors">Produtos</Link>
            <span>/</span>
            <span className="font-semibold text-slate-700 truncate max-w-[240px]">{product.name}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWishlist}
              aria-pressed={fav}
              aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className={`${iconBtn} ${fav ? 'border-rose-200 bg-rose-50' : ''}`}
            >
              <Pop value={String(fav)} className="flex">
                <Heart className={`w-5 w-5 ${fav ? 'fill-rose-600 text-rose-600' : ''}`} />
              </Pop>
            </button>
            <button onClick={handleShare} aria-label="Compartilhar" className={iconBtn}>
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Grade principal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 xl:gap-20 mb-16 lg:mb-24">
          <Gallery
            images={allImages}
            productName={product.name}
            isOutOfStock={isOutOfStock}
            isLowStock={isLowStock}
            stock={product.stock}
            isFeatured={!!product.is_featured}
          />

          {/* ── Painel ── */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-5">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600 mb-2"
              >
                {product.brand ? `${product.brand} · ${product.category}` : product.category || 'Catálogo'}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05, ease: easing.smooth }}
                className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-slate-900 leading-[1.05] tracking-[-0.03em] mb-3"
              >
                {product.name}
              </motion.h1>

              <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5">
                {hasReviews ? (
                  <>
                    <div className="flex items-center gap-0.5" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= Math.round(productRating!.avg_rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <a href="#avaliacoes" className="text-sm text-slate-600 font-medium hover:text-blue-600 transition-colors">
                      {productRating!.avg_rating.toFixed(1)} · {productRating!.review_count}{' '}
                      {productRating!.review_count === 1 ? 'avaliação' : 'avaliações'}
                    </a>
                  </>
                ) : (
                  <a href="#avaliacoes" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
                    Seja o primeiro a avaliar
                  </a>
                )}
                <span className="w-px h-3.5 bg-slate-200" aria-hidden="true" />
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500'}`} aria-hidden="true" />
                  {isOutOfStock ? 'Esgotado' : `${product.stock} em estoque`}
                </span>
              </div>
            </div>

            {/* Preço */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: easing.smooth }}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <span className="block text-[34px] sm:text-[38px] leading-none font-bold text-slate-900 tracking-[-0.03em]">
                {brl(product.price)}
              </span>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">5% OFF</span>
                  no PIX <span className="font-bold text-slate-900">{brl(pixPrice)}</span>
                </span>
                <span className="text-slate-300" aria-hidden="true">|</span>
                <span>ou 10× de <span className="font-semibold text-slate-900">{installment}</span> sem juros</span>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pague com</span>
                <div className="flex gap-1.5">
                  {['PIX', 'VISA', 'MASTER', 'ELO'].map(f => (
                    <span key={f} className="text-[10px] font-bold text-slate-600 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded-md">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Frete grátis */}
            {!isOutOfStock && (
              <div className={`rounded-2xl p-4 border ${qualifiesFreeShipping ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white ${qualifiesFreeShipping ? 'bg-emerald-500' : 'bg-blue-600'}`}>
                    <Truck className="w-4 h-4" aria-hidden="true" />
                  </div>
                  {qualifiesFreeShipping ? (
                    <p className="text-sm font-bold text-slate-900">Frete grátis liberado</p>
                  ) : (
                    <p className="text-sm text-slate-700">
                      Faltam <span className="font-bold text-slate-900">{brl(amountToFreeShipping)}</span> para o frete grátis
                    </p>
                  )}
                </div>
                <div className="h-2 w-full rounded-full bg-white overflow-hidden border border-black/5" role="progressbar" aria-valuenow={Math.round(freeShippingProgress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso para o frete grátis">
                  <motion.div
                    className={`h-full rounded-full ${qualifiesFreeShipping ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    initial={false}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={spring.soft}
                  />
                </div>
              </div>
            )}

            {/* Quantidade */}
            {!isOutOfStock && (
              <div className="flex items-center flex-wrap gap-4">
                <span className="text-sm font-bold text-slate-900">Quantidade</span>
                <div className="inline-flex items-center gap-0.5 border border-slate-200 rounded-full p-0.5">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="Diminuir quantidade"
                    className="h-11 w-11 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <Pop value={qty} className="w-9 text-center text-base font-bold text-slate-900">
                    <span aria-live="polite">{qty}</span>
                  </Pop>
                  <button
                    onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                    aria-label="Aumentar quantidade"
                    className="h-11 w-11 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {isLowStock && (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">
                    Só {product.stock} em estoque
                  </span>
                )}
              </div>
            )}

            {/* CTAs — desktop */}
            <div className="hidden lg:flex flex-col gap-2.5 pt-1">
              <motion.button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                whileTap={{ scale: 0.985 }}
                transition={spring.snappy}
                className="flex w-full items-center justify-center gap-2 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] shadow-lg shadow-blue-600/25 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-colors"
              >
                <Zap className="w-4 h-4" aria-hidden="true" />
                {isOutOfStock ? 'Esgotado' : 'Comprar agora'}
              </motion.button>
              <motion.button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                whileTap={{ scale: 0.985 }}
                transition={spring.snappy}
                className="flex w-full items-center justify-center gap-2 h-14 rounded-full bg-white border border-slate-200 text-slate-900 font-bold text-[15px] hover:border-slate-400 disabled:opacity-40 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                Adicionar ao carrinho
              </motion.button>
              <button
                onClick={handleWhatsApp}
                className="flex w-full items-center justify-center gap-2 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                Tirar dúvida no WhatsApp
              </button>
            </div>

            {/* Garantias */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: Truck, label: 'Entrega rápida', sub: 'Todo o Brasil' },
                { icon: RefreshCw, label: 'Troca em 7 dias', sub: 'Garantia pelo CDC' },
                { icon: FileText, label: 'Nota fiscal', sub: 'Em todos os pedidos' },
                { icon: Shield, label: 'Pagamento seguro', sub: 'PIX e cartão' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-white border border-slate-200">
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{label}</p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Prazo */}
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-white text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Package className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Pedido até às 16h sai hoje</p>
                <p className="text-xs text-slate-500 mt-0.5">Para Osasco/SP e região metropolitana.</p>
              </div>
            </div>

            {/* Abas — um sublinhado só, que desliza entre elas */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex border-b border-slate-200" role="tablist" aria-label="Informações do produto">
                {tabs.map(tab => {
                  const on = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      role="tab"
                      aria-selected={on}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative flex-1 h-12 text-sm font-semibold transition-colors ${on ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      {tab.label}
                      {on && (
                        <motion.span
                          layoutId="product-tab-underline"
                          transition={spring.soft}
                          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-600"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="p-5 min-h-[110px]" role="tabpanel">
                {activeTab === 'descricao' && (
                  <div className="text-sm text-slate-600 leading-relaxed">
                    <p>{product.description || 'Sem descrição disponível.'}</p>
                    {product.detailed_description && (
                      <p className="mt-3 pt-3 border-t border-slate-100 text-slate-500">{product.detailed_description}</p>
                    )}
                  </div>
                )}
                {activeTab === 'especificacoes' && (
                  <dl className="divide-y divide-slate-100">
                    {[
                      { label: 'Categoria', value: product.category || '—' },
                      ...(product.brand ? [{ label: 'Marca', value: product.brand }] : []),
                      { label: 'Disponibilidade', value: isOutOfStock ? 'Esgotado' : `${product.stock} unidades` },
                      ...(product.specs ?? []).filter(s => s.label && s.value).map(s => ({ label: s.label, value: s.value })),
                      { label: 'Garantia', value: '90 dias de fábrica' },
                      { label: 'Nota fiscal', value: 'Inclusa' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between gap-4 py-2.5">
                        <dt className="text-xs text-slate-500">{label}</dt>
                        <dd className="text-sm font-semibold text-slate-900 text-right">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {activeTab === 'frete' && (
                  <ShippingCalculator totalValue={product.price} items={[{ id: product.id, quantity: 1 }]} />
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
              Compra segura, com dados criptografados.
            </div>
          </div>
        </div>

        {/* ── Relacionados ── */}
        <Reveal y={32} className="mb-16 lg:mb-20">
          <SmartShowcase
            title="Combina com este"
            subtitle="Produtos da mesma categoria."
            mode="related"
            category={product.category}
            excludeProductId={product.id}
            limit={4}
          />
        </Reveal>

        {/* ── Avaliações ── */}
        <Reveal y={32} className="scroll-mt-24">
          <div id="avaliacoes">
            <ProductReviews productId={product.id} />
          </div>
        </Reveal>
      </main>

      {/* ── Barra de compra fixa — só mobile ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white/95 backdrop-blur border-t border-slate-200 px-4 pt-3" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 h-10 mb-2.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold active:scale-[0.98] transition-all"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          Tirar dúvida no WhatsApp
        </button>
        <div className="flex gap-2.5">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="h-14 w-14 shrink-0 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-900 disabled:opacity-40 active:scale-95 transition-all"
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
          <motion.button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            whileTap={{ scale: 0.985 }}
            transition={spring.snappy}
            className="flex-1 flex items-center justify-center gap-2 h-14 rounded-full bg-blue-600 text-white font-bold text-[15px] shadow-lg shadow-blue-600/25 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-colors"
          >
            <Zap className="w-4 h-4" aria-hidden="true" />
            {isOutOfStock ? 'Esgotado' : (
              <span className="flex items-center gap-1.5">
                Comprar · <Pop value={qty}>{brl(product.price * qty)}</Pop>
              </span>
            )}
          </motion.button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;
