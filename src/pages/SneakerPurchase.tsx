import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, ChevronDown, HelpCircle, ImageOff, Star } from 'lucide-react';
import SEO from '@/components/SEO';
import { SlideToCart } from '@/components/SlideToCart';
import { Product } from '@/types/database';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useProductRatings } from '@/hooks/useProductRatings';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { WHATSAPP_LINK } from '@/config/constants';

/** Quantos tamanhos aparecem antes do botão "ver mais". */
const SIZES_COLLAPSED = 3;
const VIEWED_KEY = 'jr_tenis_vistos';
const VIEWED_MAX = 4;

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Guarda os últimos tênis abertos, para a coluna "Vistos". */
function useRecentlyViewed(current?: Product) {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(VIEWED_KEY) ?? '[]');
    } catch {
      return [];
    }
  });

  const currentId = current?.id;
  useEffect(() => {
    if (!currentId) return;
    setIds((prev) => {
      const next = [currentId, ...prev.filter((id) => id !== currentId)].slice(0, VIEWED_MAX + 1);
      try { localStorage.setItem(VIEWED_KEY, JSON.stringify(next)); } catch { /* modo privado */ }
      return next;
    });
  }, [currentId]);

  // O atual não se lista como "visto".
  return ids.filter((id) => id !== currentId).slice(0, VIEWED_MAX);
}

const SneakerPurchase: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { usePageVisit } = useAnalytics();
  usePageVisit('tenis-produto');

  const { data: product, isLoading, isError } = useProduct(id);
  const { data: allProducts } = useProducts();
  const { data: ratings } = useProductRatings();
  const { addToCart, getTotalItems } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [size, setSize] = useState<string>();
  const [color, setColor] = useState<string>();
  const [sizesOpen, setSizesOpen] = useState(false);

  const sizes = useMemo(() => product?.sizes ?? [], [product]);
  const colors = useMemo(() => product?.colors ?? [], [product]);

  // Com uma cor só, não há escolha a fazer — já vem marcada.
  useEffect(() => {
    if (colors.length === 1) setColor(colors[0].name);
  }, [colors]);

  const viewedIds = useRecentlyViewed(product ?? undefined);
  const viewed = useMemo(
    () => viewedIds.map((vid) => allProducts?.find((p) => p.id === vid)).filter(Boolean) as Product[],
    [viewedIds, allProducts],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4" aria-busy="true">
        <div className="mx-auto max-w-md space-y-4">
          <div className="h-11 w-11 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-7 w-2/3 rounded bg-slate-100 animate-pulse" />
          <div className="aspect-square rounded-3xl bg-slate-100 animate-pulse" />
          <div className="h-[68px] rounded-full bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm font-semibold text-slate-700">Não encontramos esse tênis.</p>
        <Link to="/tenis" className="text-sm font-semibold text-blue-600">Voltar para a aba de tênis</Link>
      </div>
    );
  }

  const rating = ratings?.[product.id];
  const outOfStock = product.stock === 0;
  const needsSize = sizes.length > 0 && !size;
  const shownSizes = sizesOpen ? sizes : sizes.slice(0, SIZES_COLLAPSED);
  const cartCount = getTotalItems();
  const fav = isInWishlist(product.id);

  const handleAdd = () => {
    addToCart(product, { size, color });
    toast({
      title: 'Adicionado ao carrinho',
      description: [product.name, size && `Tam ${size}`, color].filter(Boolean).join(' · '),
    });
  };

  const whatsapp = `${WHATSAPP_LINK}?text=${encodeURIComponent(
    `Olá! Tenho uma dúvida sobre o ${product.name}.`,
  )}`;

  return (
    <div className="min-h-screen bg-white pb-40">
      <SEO
        title={`${product.name} | JR Acessórios`}
        description={product.description || `${product.name} na JR Acessórios.`}
      />

      <div className="mx-auto max-w-md px-4">
        {/* ═══ Topo ═══ */}
        <div className="h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="h-11 w-11 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <span className="text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase truncate px-2">
            {product.brand || 'JR Acessórios'}
          </span>

          <Link
            to="/checkout"
            aria-label={`Carrinho com ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
            className="relative h-11 w-11 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* ═══ Título ═══ */}
        <div className="text-center pt-3">
          <h1 className="text-[26px] leading-tight font-bold tracking-[-0.02em] text-slate-900">{product.name}</h1>
          <p className="mt-1 text-sm text-slate-400">{product.category}</p>
          {rating && rating.review_count > 0 && (
            <p className="mt-1.5 inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-600">{rating.avg_rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({rating.review_count})</span>
            </p>
          )}
        </div>

        {/* ═══ Tamanho · cor · favorito · foto ═══ */}
        <div className="relative mt-4 grid grid-cols-[56px_1fr_56px] gap-2">
          {/* Coluna de tamanhos */}
          <div className="relative z-10">
            {sizes.length > 0 && (
              <>
                <span className="block text-[11px] font-bold text-slate-900 text-center mb-2">Tamanho</span>
                <div className="flex flex-col gap-2">
                  {shownSizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                      className={`h-[52px] rounded-2xl border text-sm font-semibold transition-all ${
                        size === s
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  {sizes.length > SIZES_COLLAPSED && (
                    <button
                      type="button"
                      onClick={() => setSizesOpen((o) => !o)}
                      aria-expanded={sizesOpen}
                      className="h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${sizesOpen ? 'rotate-180' : ''}`} />
                      <span className="sr-only">{sizesOpen ? 'Ver menos tamanhos' : 'Ver mais tamanhos'}</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Cores + foto */}
          <div className="min-w-0">
            {colors.length > 0 && (
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-[10px] font-medium text-slate-400 mb-1.5">
                  {color ?? 'Escolha a cor'}
                </span>
                <div className="flex items-center gap-2.5">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.name)}
                      aria-pressed={color === c.name}
                      aria-label={c.name}
                      title={c.name}
                      className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                        color === c.name ? 'border-2 border-slate-900' : 'border border-transparent'
                      }`}
                    >
                      <span
                        className="h-7 w-7 rounded-lg border border-black/10"
                        style={{ backgroundColor: c.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative mt-2 aspect-square flex items-center justify-center">
              {/* Marca d'água atrás da foto */}
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center text-[64px] font-bold tracking-tighter text-slate-100 select-none pointer-events-none"
              >
                {(product.brand || 'JR').toUpperCase()}
              </span>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="relative max-h-full max-w-full object-contain -rotate-[8deg] drop-shadow-2xl"
                />
              ) : (
                <ImageOff className="relative h-10 w-10 text-slate-300" aria-hidden="true" />
              )}
            </div>
          </div>

          {/* Favorito */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-900 mb-2">Fav</span>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={fav}
              aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className="h-[52px] w-[52px] rounded-2xl border border-slate-200 bg-white flex items-center justify-center hover:border-slate-400 transition-colors"
            >
              <Heart className={`h-5 w-5 ${fav ? 'text-rose-600 fill-rose-600' : 'text-slate-900'}`} />
            </button>
            <span className="mt-1.5 text-[10px] text-slate-400">{fav ? 'Salvo' : 'Salvar'}</span>
          </div>
        </div>

        {/* ═══ Dúvida · preço · vistos ═══ */}
        <div className="mt-4 grid grid-cols-[56px_1fr_56px] gap-2 items-start">
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-900 mb-2">Dúvida</span>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Tirar dúvida no WhatsApp"
              className="h-[52px] w-[52px] rounded-2xl border border-slate-200 flex items-center justify-center text-slate-900 hover:border-slate-400 transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
            </a>
          </div>

          <div className="text-center pt-1">
            <span className="block text-sm font-bold text-slate-900">Preço</span>
            <span className="block mt-0.5 text-[40px] leading-none font-bold tracking-[-0.03em] text-slate-900">
              {brl(product.price)}
            </span>
            {outOfStock ? (
              <span className="mt-2 inline-block text-xs font-semibold text-rose-600">Esgotado</span>
            ) : product.stock <= 5 ? (
              <span className="mt-2 inline-block text-xs font-semibold text-amber-600">
                Últimas {product.stock} unidades
              </span>
            ) : null}
          </div>

          <div className="flex flex-col items-center">
            {viewed.length > 0 && (
              <>
                <span className="text-[11px] font-bold text-slate-900 mb-2">Vistos</span>
                <div className="flex flex-col gap-2">
                  {viewed.map((v) => (
                    <Link
                      key={v.id}
                      to={`/tenis/${v.id}`}
                      title={v.name}
                      className="h-[52px] w-[52px] rounded-2xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden hover:border-slate-400 transition-colors"
                    >
                      {v.image ? (
                        <img src={v.image} alt={v.name} className="max-h-full max-w-full object-contain p-1" />
                      ) : (
                        <ImageOff className="h-4 w-4 text-slate-300" aria-hidden="true" />
                      )}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Barra de compra ═══ */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 pt-3 pb-4 px-4">
        <div className="mx-auto max-w-md">
          {/* Quando o botão está desabilitado ele já diz o motivo — evita repetir. */}
          {!outOfStock && !needsSize && (
            <p className="text-center text-[13px] font-bold text-slate-900 mb-2.5">Arraste para a direita</p>
          )}
          <SlideToCart
            label="Adicionar ao carrinho"
            disabled={outOfStock || needsSize}
            disabledLabel={outOfStock ? 'Esgotado' : 'Escolha um tamanho'}
            onConfirm={handleAdd}
          />
        </div>
      </div>
    </div>
  );
};

export default SneakerPurchase;
