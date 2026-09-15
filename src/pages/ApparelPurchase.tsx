import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Heart, Minus, Plus, ShoppingBag, ImageOff, Star, Share2, Check,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { AnimatePresence, motion } from 'framer-motion';
import { Pop } from '@/components/animations/Pop';
import { spring } from '@/lib/motion';
import { useProduct } from '@/hooks/useProducts';
import { useProductRatings } from '@/hooks/useProductRatings';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';

/** Produto cadastrado nos últimos 30 dias ganha o selo "Novo". */
const NEW_DAYS = 30;

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const isRecent = (iso?: string) => {
  if (!iso) return false;
  const days = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  return days >= 0 && days <= NEW_DAYS;
};

const ApparelPurchase: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { usePageVisit, trackProductView } = useAnalytics();
  usePageVisit('roupas-produto');

  const { data: product, isLoading, isError } = useProduct(id);
  const { data: ratings } = useProductRatings();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [size, setSize] = useState<string>();
  const [color, setColor] = useState<string>();
  const [qty, setQty] = useState(1);
  const [shot, setShot] = useState(0);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (product?.id) trackProductView(product.id);
  }, [product?.id, trackProductView]);

  const sizes = useMemo(() => product?.sizes ?? [], [product]);
  const colors = useMemo(() => product?.colors ?? [], [product]);

  // Galeria: a imagem principal primeiro, sem repetir.
  const gallery = useMemo(() => {
    if (!product) return [];
    return [...new Set([product.image, ...(product.images ?? [])].filter(Boolean))];
  }, [product]);

  useEffect(() => {
    if (colors.length === 1) setColor(colors[0].name);
  }, [colors]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4" aria-busy="true">
        <div className="mx-auto max-w-md space-y-4">
          <div className="h-11 w-11 rounded-full skeleton" />
          <div className="aspect-[4/5] rounded-3xl skeleton" />
          <div className="h-6 w-2/3 rounded skeleton" />
          <div className="h-14 rounded-2xl skeleton" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm font-semibold text-slate-700">Não encontramos essa peça.</p>
        <Link to="/roupas" className="text-sm font-semibold text-blue-600">Voltar para a aba de roupas</Link>
      </div>
    );
  }

  const rating = ratings?.[product.id];
  const outOfStock = product.stock === 0;
  const needsSize = sizes.length > 0 && !size;
  const maxQty = Math.max(1, product.stock);
  const fav = isInWishlist(product.id);
  const total = product.price * qty;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product, { size, color });
    toast({
      title: qty > 1 ? `${qty} itens adicionados` : 'Adicionado à sacola',
      description: [product.name, size && `Tam ${size}`, color].filter(Boolean).join(' · '),
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 1600);
      }
    } catch {
      // usuário cancelou o compartilhamento, ou a área de transferência foi negada
    }
  };

  return (
    <div className="min-h-screen bg-white pb-44">
      <SEO
        title={`${product.name} | JR Acessórios`}
        description={product.description || `${product.name} na JR Acessórios.`}
      />

      {/* ═══ Foto + controles sobrepostos ═══ */}
      <div className="relative mx-auto max-w-md">
        <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
          {gallery[shot] ? (
            <AnimatePresence initial={false}>
              <motion.img
                key={shot}
                src={gallery[shot]}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              />
            </AnimatePresence>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <ImageOff className="h-10 w-10 text-slate-300" aria-hidden="true" />
            </div>
          )}

          <div className="absolute top-4 inset-x-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Voltar"
              className="h-11 w-11 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center text-slate-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Compartilhar"
              className="h-11 w-11 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center text-slate-900"
            >
              {shared ? <Check className="h-5 w-5 text-emerald-600" /> : <Share2 className="h-5 w-5" />}
            </button>
          </div>

          {/* Miniaturas — só quando há mais de uma foto */}
          {gallery.length > 1 && (
            <div className="absolute right-4 top-20 flex flex-col gap-2">
              {gallery.slice(0, 4).map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setShot(i)}
                  aria-label={`Foto ${i + 1} de ${gallery.length}`}
                  aria-pressed={i === shot}
                  className={`h-14 w-14 rounded-xl overflow-hidden bg-white transition-all ${
                    i === shot ? 'ring-2 ring-slate-900' : 'ring-1 ring-black/10 opacity-70'
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Ficha ═══ */}
      <div className="relative mx-auto max-w-md -mt-6 rounded-t-3xl bg-white px-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {isRecent(product.created_at) && (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold tracking-wide">
                  NOVO
                </span>
              )}
              {!outOfStock && product.stock <= 5 && (
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold tracking-wide">
                  ÚLTIMAS {product.stock}
                </span>
              )}
              {product.brand && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wide uppercase">
                  {product.brand}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-[22px] leading-tight font-bold tracking-[-0.02em] text-slate-900">
              {product.name}
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">{product.category}</p>
            {rating && rating.review_count > 0 && (
              <p className="mt-1.5 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-600">{rating.avg_rating.toFixed(1)}</span>
                <span className="text-xs text-slate-400">({rating.review_count})</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-pressed={fav}
            aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className="h-11 w-11 shrink-0 rounded-full border border-slate-200 flex items-center justify-center hover:border-slate-400 transition-colors"
          >
            <Pop value={String(fav)} className="flex">
              <Heart className={`h-5 w-5 ${fav ? 'text-rose-600 fill-rose-600' : 'text-slate-900'}`} />
            </Pop>
          </button>
        </div>

        {/* ─── Tamanho ─── */}
        {sizes.length > 0 && (
          <div className="mt-5">
            <span className="text-sm font-bold text-slate-900">Escolha o tamanho</span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {sizes.map((s) => (
                <motion.button
                  key={s}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  transition={spring.snappy}
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={`min-w-[52px] h-11 px-3 rounded-full text-sm font-semibold border transition-all ${
                    size === s
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Cor ─── */}
        {colors.length > 0 && (
          <div className="mt-5">
            <span className="text-sm font-bold text-slate-900">
              Cor{color ? <span className="font-normal text-slate-400"> · {color}</span> : null}
            </span>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  aria-pressed={color === c.name}
                  aria-label={c.name}
                  title={c.name}
                  className={`h-11 w-11 rounded-full flex items-center justify-center border-2 transition-all ${
                    color === c.name ? 'border-slate-900' : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  <span
                    className="h-7 w-7 rounded-full border border-black/10"
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Quantidade ─── */}
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <span className="block text-sm font-bold text-slate-900">Quantidade</span>
            <div className="mt-2.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Diminuir quantidade"
                className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center text-slate-900 disabled:text-slate-300 disabled:border-slate-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span aria-live="polite" className="w-10 text-center text-base font-bold text-slate-900">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={qty >= maxQty}
                aria-label="Aumentar quantidade"
                className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center text-slate-900 disabled:text-slate-300 disabled:border-slate-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-xs font-semibold text-slate-400">
              {qty > 1 ? `Total (${qty}×)` : 'Total'}
            </span>
            <span className="block text-[26px] leading-none font-bold tracking-[-0.02em] text-slate-900">
              {brl(total)}
            </span>
            {qty > 1 && (
              <span className="block mt-0.5 text-[11px] text-slate-400">{brl(product.price)} cada</span>
            )}
          </div>
        </div>

        {product.description && (
          <p className="mt-5 text-sm leading-relaxed text-slate-500">{product.description}</p>
        )}
      </div>

      {/* ═══ Barra de compra ═══ */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 px-4 pt-3 pb-4">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock || needsSize}
            className="w-full h-14 rounded-full bg-slate-900 text-white text-[15px] font-bold flex items-center justify-center gap-2 disabled:bg-slate-100 disabled:text-slate-400 active:scale-[0.99] transition-all"
          >
            <ShoppingBag className="h-5 w-5" />
            {outOfStock ? 'Esgotado' : needsSize ? 'Escolha um tamanho' : 'Adicionar à sacola'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApparelPurchase;
