import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Heart, Minus, Plus, ImageOff, Star, Share2, Check,
  Truck, Zap, ShieldCheck, CreditCard, MessageCircle, FileText,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { AnimatePresence, motion } from 'framer-motion';
import { Pop } from '@/components/animations/Pop';
import { easing, spring } from '@/lib/motion';
import { useProduct } from '@/hooks/useProducts';
import { useProductRatings } from '@/hooks/useProductRatings';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ShippingCalculator } from '@/components/ShippingCalculator';
import { ProductReviews } from '@/components/ProductReviews';
import { SmartShowcase } from '@/components/SmartShowcase';
import { WHATSAPP_LINK } from '@/config/constants';
import { ELECTRONICS, ELECTRONICS_KINDS, electronicsKind } from '@/lib/catalogGroups';

/** Produto cadastrado nos últimos 30 dias ganha o selo "Novo". */
const NEW_DAYS = 30;

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const isRecent = (iso?: string) => {
  if (!iso) return false;
  const days = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  return days >= 0 && days <= NEW_DAYS;
};

/** "#abc" ou "#aabbcc" → rgba com a opacidade pedida. Cor inválida cai no azul da marca. */
const withAlpha = (hex: string | undefined, alpha: number) => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex?.trim() ?? '');
  const h = m ? (m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1]) : '2563eb';
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

const SECTION_MOTION = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5, ease: easing.smooth },
} as const;

const ElectronicsPurchase: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { usePageVisit, trackProductView } = useAnalytics();
  usePageVisit('eletronicos-produto');

  const { data: product, isLoading, isError } = useProduct(id);
  const { data: ratings } = useProductRatings();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [storage, setStorage] = useState<string>();
  const [color, setColor] = useState<string>();
  const [qty, setQty] = useState(1);
  const [shot, setShot] = useState(0);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (product?.id) trackProductView(product.id);
  }, [product?.id, trackProductView]);

  // Nos eletrônicos a grade de "tamanhos" guarda o armazenamento (128 GB, 256 GB…).
  const storages = useMemo(() => product?.sizes ?? [], [product]);
  const colors = useMemo(() => product?.colors ?? [], [product]);
  const specs = useMemo(() => (product?.specs ?? []).filter((s) => s.label && s.value), [product]);

  // Galeria: a imagem principal primeiro, sem repetir.
  const gallery = useMemo(() => {
    if (!product) return [];
    return [...new Set([product.image, ...(product.images ?? [])].filter(Boolean))];
  }, [product]);

  useEffect(() => {
    setStorage(storages[0]);
    setColor(colors[0]?.name);
    setShot(0);
    setQty(1);
  }, [storages, colors]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4" aria-busy="true">
        <div className="mx-auto max-w-md space-y-4">
          <div className="h-11 w-11 rounded-full skeleton" />
          <div className="h-[420px] rounded-[28px] skeleton" />
          <div className="h-6 w-2/3 rounded skeleton" />
          <div className="h-14 rounded-2xl skeleton" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm font-semibold text-slate-700">Não encontramos esse produto.</p>
        <Link to={`/${ELECTRONICS.slug}`} className="text-sm font-semibold text-blue-600">
          Voltar para a aba de eletrônicos
        </Link>
      </div>
    );
  }

  const rating = ratings?.[product.id];
  const outOfStock = product.stock === 0;
  const maxQty = Math.max(1, product.stock);
  const fav = isInWishlist(product.id);
  const total = product.price * qty;
  const currentColor = colors.find((c) => c.name === color);
  const glow = withAlpha(currentColor?.hex, currentColor ? 0.55 : 0.45);
  const kindLabel = ELECTRONICS_KINDS.find((k) => k.id === electronicsKind(product.category))?.label ?? ELECTRONICS.title;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product, { size: storage, color });
    toast({
      title: qty > 1 ? `${qty} itens adicionados` : 'Adicionado ao carrinho',
      description: [product.name, storage, color].filter(Boolean).join(' · '),
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

  const whatsapp = `${WHATSAPP_LINK}?text=${encodeURIComponent(`Olá! Tenho uma dúvida sobre o ${product.name}.`)}`;

  return (
    <div className="min-h-screen overflow-x-clip bg-white pb-36">
      <SEO
        title={`${product.name} | JR Acessórios`}
        description={product.description || `${product.name} na JR Acessórios.`}
      />

      {/* ═══ Barra superior ═══ */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-5xl px-3 h-14 grid grid-cols-[44px_1fr_44px] items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="h-11 w-11 flex items-center justify-center text-slate-900"
          >
            <ArrowLeft className="h-[22px] w-[22px]" />
          </button>
          <div className="flex flex-col items-center leading-none">
            <span className="text-[9px] font-extrabold tracking-[0.26em] text-slate-900">JR ACESSÓRIOS</span>
            <span className="mt-0.5 text-[11px] font-medium text-slate-500">{kindLabel}</span>
          </div>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartilhar"
            className="h-11 w-11 flex items-center justify-center text-slate-900"
          >
            {shared ? <Check className="h-5 w-5 text-emerald-600" /> : <Share2 className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 lg:grid lg:grid-cols-[440px_minmax(0,1fr)] lg:items-start lg:gap-10">
        {/* ═══ Palco ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easing.smooth }}
          className="pt-2 lg:sticky lg:top-20"
          aria-label="Fotos do produto"
        >
          <div className="relative overflow-hidden rounded-[28px] bg-[#0b1b3a] p-[18px] text-white">
            <div
              className="pointer-events-none absolute left-1/2 top-[40px] h-[340px] w-[340px] -translate-x-1/2 rounded-full transition-[background] duration-500"
              style={{ background: `radial-gradient(circle, ${glow} 0%, rgba(11,27,58,0) 64%)` }}
              aria-hidden="true"
            />

            <div className="relative flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                {isRecent(product.created_at) && (
                  <span className="inline-flex h-[26px] items-center rounded-full bg-amber-400 px-2.5 text-[10px] font-extrabold tracking-[0.18em] text-slate-900">
                    NOVO
                  </span>
                )}
                {!outOfStock && product.stock <= 5 && (
                  <span className="inline-flex h-[26px] items-center rounded-full bg-rose-500 px-2.5 text-[10px] font-extrabold tracking-[0.18em]">
                    ÚLTIMAS {product.stock}
                  </span>
                )}
                {outOfStock && (
                  <span className="inline-flex h-[26px] items-center rounded-full bg-white/[0.12] px-2.5 text-[10px] font-extrabold tracking-[0.18em]">
                    ESGOTADO
                  </span>
                )}
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                transition={spring.snappy}
                onClick={() => toggleWishlist(product.id)}
                aria-pressed={fav}
                aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
              >
                <Pop value={fav ? 1 : 0}>
                  <Heart className={`h-5 w-5 ${fav ? 'fill-rose-400 text-rose-400' : 'text-white'}`} />
                </Pop>
              </motion.button>
            </div>

            <div className="relative flex h-[300px] items-center justify-center sm:h-[340px]">
              {gallery[shot] ? (
                <AnimatePresence initial={false} mode="wait">
                  <motion.img
                    key={shot}
                    src={gallery[shot]}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="max-h-[280px] max-w-[82%] object-contain drop-shadow-[0_26px_30px_rgba(0,0,0,0.5)] sm:max-h-[320px]"
                  />
                </AnimatePresence>
              ) : (
                <ImageOff className="h-10 w-10 text-white/20" aria-hidden="true" />
              )}
            </div>

            {gallery.length > 1 && (
              <div className="relative flex justify-center gap-2">
                {gallery.slice(0, 5).map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setShot(i)}
                    aria-label={`Foto ${i + 1} de ${gallery.length}`}
                    aria-pressed={i === shot}
                    className={`h-12 w-12 rounded-xl bg-white/[0.06] p-1.5 transition-all ${
                      i === shot ? 'ring-2 ring-white' : 'ring-1 ring-white/15 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        <div>
          {/* ═══ Ficha ═══ */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: easing.smooth }}
            className="pt-5"
          >
            {product.brand && (
              <span className="block text-[10px] font-extrabold tracking-[0.2em] text-slate-500 uppercase">{product.brand}</span>
            )}
            <div className="mt-1 flex items-end justify-between gap-3">
              <h1 className="text-[26px] leading-[1.05] font-extrabold tracking-[-0.03em] text-slate-900 sm:text-3xl">
                {product.name}
              </h1>
              {rating && rating.review_count > 0 && (
                <a href="#avaliacoes-titulo" className="flex shrink-0 items-center gap-1 pb-1">
                  <Star className="h-[13px] w-[13px] text-amber-400 fill-amber-400" aria-hidden="true" />
                  <span className="text-xs font-bold text-slate-900">{rating.avg_rating.toFixed(1)}</span>
                  <span className="text-[11px] text-slate-400">({rating.review_count})</span>
                </a>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-400">{product.category}</p>

            {storages.length > 0 && (
              <div className="mt-5">
                <span className="text-sm font-bold text-slate-900">Armazenamento</span>
                <div className="mt-2.5 flex flex-wrap gap-2" role="radiogroup" aria-label="Armazenamento">
                  {storages.map((s) => {
                    const on = s === storage;
                    return (
                      <motion.button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        whileTap={{ scale: 0.95 }}
                        transition={spring.snappy}
                        onClick={() => setStorage(s)}
                        className={`h-11 min-w-[88px] flex-1 rounded-xl border px-3 text-[13px] font-bold transition-colors sm:flex-none ${
                          on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {s}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="mt-5">
                <span className="text-sm font-bold text-slate-900">
                  Cor{color ? <span className="font-normal text-slate-400"> · {color}</span> : null}
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Cor">
                  {colors.map((c) => {
                    const on = c.name === color;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        aria-label={c.name}
                        title={c.name}
                        onClick={() => setColor(c.name)}
                        className={`h-11 w-11 rounded-full border-2 flex items-center justify-center transition-colors ${
                          on ? 'border-slate-900' : 'border-transparent hover:border-slate-200'
                        }`}
                      >
                        <span className="block h-7 w-7 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Quantidade + preço ─── */}
            <div className="mt-5 flex items-end justify-between gap-4 border-t border-slate-200 pt-5">
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
                  <span aria-live="polite" className="w-10 text-center text-base font-bold text-slate-900">{qty}</span>
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
                <Pop value={total}>
                  <span className="block text-[28px] leading-none font-extrabold tracking-[-0.03em] text-slate-900">{brl(total)}</span>
                </Pop>
                <span className="mt-1.5 block text-[11px] text-slate-500">em até 10× de {brl(total / 10)} sem juros</span>
                <span className="mt-0.5 block text-xs font-bold text-emerald-600">{brl(total * 0.95)} no PIX · 5% OFF</span>
              </div>
            </div>

            {product.description && (
              <p className="mt-5 text-sm leading-relaxed text-slate-500">{product.description}</p>
            )}

            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-900 hover:border-slate-400 transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              Tirar dúvida no WhatsApp
            </a>
          </motion.section>

          {/* ═══ Ficha técnica ═══ */}
          {(specs.length > 0 || product.detailed_description) && (
            <motion.section {...SECTION_MOTION} className="pt-8" aria-labelledby="ficha-titulo">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 id="ficha-titulo" className="text-xl font-extrabold tracking-[-0.03em] text-slate-900">Ficha técnica</h2>
              </div>
              {specs.length > 0 && (
                <dl className="mt-3 overflow-hidden rounded-2xl border border-slate-200 sm:grid sm:grid-cols-2">
                  {specs.map((s, i) => (
                    <div
                      key={s.label}
                      className={`flex items-baseline justify-between gap-4 px-4 py-3 ${i % 2 ? 'bg-white' : 'bg-slate-50'} sm:flex-col sm:items-start sm:gap-1 sm:border-b sm:border-slate-100`}
                    >
                      <dt className="text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">{s.label}</dt>
                      <dd className="text-sm font-semibold text-slate-900 text-right sm:text-left">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {product.detailed_description && (
                <p className="mt-3 text-sm leading-relaxed text-slate-500 whitespace-pre-line">{product.detailed_description}</p>
              )}
            </motion.section>
          )}

          {/* ═══ Frete ═══ */}
          <motion.section {...SECTION_MOTION} className="pt-8">
            <div className="rounded-2xl border border-slate-200 p-4">
              <ShippingCalculator totalValue={total} items={[{ id: product.id, quantity: qty }]} />
            </div>
          </motion.section>

          {/* ═══ Condições ═══ */}
          <motion.section {...SECTION_MOTION} className="pt-5" aria-label="Condições de compra">
            <ul className="grid grid-cols-2 gap-2.5">
              {[
                { Icon: Truck, t: 'Entrega rápida', d: 'Mesmo dia em Osasco' },
                { Icon: Zap, t: '5% no PIX', d: 'Aprovação imediata' },
                { Icon: CreditCard, t: '10× sem juros', d: 'No cartão' },
                { Icon: ShieldCheck, t: 'Troca em 7 dias', d: 'Garantia pelo CDC' },
              ].map(({ Icon, t, d }) => (
                <li key={t} className="flex items-center gap-2.5 rounded-2xl border border-slate-200 px-3.5 py-3">
                  <Icon className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-slate-900">{t}</span>
                    <span className="block text-[10.5px] text-slate-500">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </motion.section>
        </div>
      </main>

      {/* ═══ Relacionados + avaliações ═══ */}
      <div className="mx-auto max-w-5xl px-4">
        <motion.div {...SECTION_MOTION} className="pt-10">
          <SmartShowcase
            mode="related"
            title="Você também pode gostar"
            subtitle="Outros modelos da mesma linha."
            category={product.category}
            excludeProductId={product.id}
          />
        </motion.div>
        <ProductReviews productId={product.id} />
      </div>

      {/* ═══ Barra de compra ═══ */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-4 pt-3 pb-4">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 shrink-0">
            <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Total</span>
            <span className="block text-lg font-extrabold leading-none tracking-[-0.02em] text-slate-900 whitespace-nowrap">{brl(total)}</span>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            transition={spring.snappy}
            onClick={handleAdd}
            disabled={outOfStock}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 text-[15px] font-bold text-white hover:bg-blue-700 transition-colors disabled:bg-slate-100 disabled:text-slate-400"
          >
            {outOfStock ? 'Esgotado' : 'Adicionar ao carrinho'}
            {!outOfStock && <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ElectronicsPurchase;
