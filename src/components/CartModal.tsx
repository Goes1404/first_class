import React, { useMemo } from 'react';
import { Lock, Plus, Minus, ShoppingBag, Trash2, ArrowRight, Sparkles, Truck, ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { useProducts, useAppSettings } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Pop } from '@/components/animations/Pop';
import { spring } from '@/lib/motion';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ─── styles ──────────────────────────────────────────────────────────────────
const styles = {
  sheet: 'w-full sm:max-w-md bg-white border-l border-slate-200 p-0 flex flex-col',
  header: 'px-5 py-4 border-b border-slate-200',
  title: 'flex items-center gap-2 text-base font-bold text-slate-900',
  scrollArea: 'flex-1 overflow-y-auto',
  // Vazio
  emptyWrap: 'h-full flex flex-col items-center justify-center p-10 text-center gap-5',
  emptyIconWrap: 'h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center',
  emptyTitle: 'text-lg font-bold text-slate-900',
  emptySubtitle: 'text-sm text-slate-500 max-w-[220px] mx-auto',
  emptyBtn: 'h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm',
  // Com itens
  contentWrap: 'p-5 space-y-6',
  // Frete grátis
  shippingCard: (complete: boolean) =>
    `p-4 rounded-2xl border ${complete ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`,
  shippingIconWrap: (complete: boolean) =>
    `h-9 w-9 rounded-xl flex items-center justify-center ${
      complete ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
    }`,
  shippingBarTrack: 'h-2 w-full bg-white rounded-full overflow-hidden border border-black/5',
  shippingBarFill: (complete: boolean) => `h-full rounded-full ${complete ? 'bg-emerald-500' : 'bg-blue-600'}`,
  // Lista
  itemsHeaderRow: 'flex items-center justify-between px-1',
  itemsHeaderLabel: 'text-[11px] font-semibold uppercase tracking-wider text-slate-400',
  itemRow: 'relative flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200',
  itemThumb: 'h-20 w-20 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center shrink-0',
  itemThumbImg: 'h-full w-full object-contain p-1.5',
  itemInfo: 'flex-1 min-w-0 space-y-1.5',
  itemName: 'text-sm font-semibold text-slate-900 line-clamp-1 pr-9',
  itemVariant: 'text-[11px] text-slate-500',
  itemPrice: 'text-sm font-bold text-slate-900',
  itemQtyRow: 'inline-flex items-center gap-0.5 border border-slate-200 rounded-full p-0.5',
  itemQtyBtn: 'h-9 w-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors',
  itemQtyNum: 'w-7 text-center text-sm font-bold text-slate-900',
  itemRemoveBtn: 'absolute top-2 right-2 h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors',
  // Sugestão
  upsellSection: 'pt-5 border-t border-slate-200',
  upsellHeader: 'flex items-center gap-1.5 mb-3',
  upsellCard: 'p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3',
  upsellThumb: 'h-14 w-14 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0',
  upsellAddBtn: 'h-9 w-9 p-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center',
  // Rodapé
  footer: 'p-5 bg-white border-t border-slate-200 space-y-4',
  summaryRow: 'flex items-center justify-between',
  summaryLabel: 'text-sm text-slate-500',
  summaryValue: 'text-sm font-semibold text-slate-900',
  shippingValueText: (free: boolean) => `text-sm font-semibold ${free ? 'text-emerald-600' : 'text-slate-900'}`,
  totalRow: 'flex items-center justify-between pt-3 border-t border-slate-200',
  totalLabel: 'text-sm font-bold text-slate-900',
  totalValue: 'text-2xl font-bold text-slate-900 tracking-[-0.02em]',
  checkoutBtn: 'w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] flex items-center justify-center gap-2',
};
// ─────────────────────────────────────────────────────────────────────────────

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, addToCart } = useCart();
  const { data: allProducts = [] } = useProducts();
  const { data: settings } = useAppSettings();
  const FREE_SHIPPING_THRESHOLD = Number(settings?.free_shipping_threshold) || 500;
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const progressToFreeShipping = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - totalPrice;
  const isFreeShipping = progressToFreeShipping >= 100;

  const upsellItem = useMemo(() => {
    if (cartItems.length === 0) return null;
    const cartIds = cartItems.map((i) => i.id);
    return allProducts
      .filter((p) => !cartIds.includes(p.id) && Number(p.price) < 150)
      .sort((a, b) => Number(b.stock) - Number(a.stock))[0];
  }, [allProducts, cartItems]);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className={styles.sheet}>
        <SheetHeader className={styles.header}>
          <SheetTitle className={styles.title}>
            <ShoppingBag className="h-5 w-5 text-blue-600" aria-hidden="true" />
            Sua sacola
            {totalItems > 0 && (
              <span className="ml-1 text-sm font-semibold text-slate-400">
                · {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className={styles.scrollArea}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyWrap}>
              <div className={styles.emptyIconWrap}>
                <ShoppingBag className="h-8 w-8 text-slate-400" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h3 className={styles.emptyTitle}>Sua sacola está vazia</h3>
                <p className={styles.emptySubtitle}>Adicione produtos e eles aparecem aqui.</p>
              </div>
              <Button onClick={() => { onClose(); navigate('/produtos'); }} className={styles.emptyBtn}>
                Ver produtos
              </Button>
            </div>
          ) : (
            <div className={styles.contentWrap}>
              {/* Frete grátis */}
              <div className={styles.shippingCard(isFreeShipping)}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={styles.shippingIconWrap(isFreeShipping)}>
                      <Truck className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isFreeShipping ? 'Frete grátis liberado' : 'Frete grátis'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {isFreeShipping ? (
                          'Aplicado no seu pedido.'
                        ) : (
                          <>Faltam <span className="font-semibold text-slate-900">{brl(amountToFreeShipping)}</span></>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className={styles.shippingBarTrack} role="progressbar" aria-valuenow={Math.round(progressToFreeShipping)} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso para o frete grátis">
                    <motion.div
                      className={styles.shippingBarFill(isFreeShipping)}
                      initial={false}
                      animate={{ width: `${progressToFreeShipping}%` }}
                      transition={spring.soft}
                    />
                  </div>
                </div>
              </div>

              {/* Itens */}
              <div className="space-y-3">
                <div className={styles.itemsHeaderRow}>
                  <span className={styles.itemsHeaderLabel}>Itens</span>
                  <span className={styles.itemsHeaderLabel}>{totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
                </div>
                <AnimatePresence initial={false}>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.lineId}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 24, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.22 }}
                      className={styles.itemRow}
                    >
                      <div className={styles.itemThumb}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} className={styles.itemThumbImg} />
                        ) : (
                          <ImageOff className="h-5 w-5 text-slate-300" aria-hidden="true" />
                        )}
                      </div>
                      <div className={styles.itemInfo}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        {(item.selectedSize || item.selectedColor) && (
                          <p className={styles.itemVariant}>
                            {[item.selectedSize && `Tam ${item.selectedSize}`, item.selectedColor]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        )}
                        <p className={styles.itemPrice}>{brl(item.price)}</p>
                        <div className={styles.itemQtyRow}>
                          <button
                            onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                            className={styles.itemQtyBtn}
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <Pop value={item.quantity} className={styles.itemQtyNum}>
                            <span aria-live="polite">{item.quantity}</span>
                          </Pop>
                          <button
                            onClick={() => updateQuantity(item.lineId, Math.min(item.quantity + 1, item.stock))}
                            disabled={item.quantity >= item.stock}
                            className={`${styles.itemQtyBtn} disabled:opacity-30 disabled:cursor-not-allowed`}
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {item.quantity >= item.stock && (
                          <span className="block text-[11px] font-medium text-amber-600">
                            Máx. {item.stock} un. em estoque
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.lineId)}
                        className={styles.itemRemoveBtn}
                        aria-label={`Remover ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Sugestão */}
              {upsellItem && (
                <div className={styles.upsellSection}>
                  <div className={styles.upsellHeader}>
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Você também pode gostar
                    </span>
                  </div>
                  <div className={styles.upsellCard}>
                    <div className={styles.upsellThumb}>
                      {upsellItem.image ? (
                        <img src={upsellItem.image} alt={upsellItem.name} className="h-full w-full object-contain p-1" />
                      ) : (
                        <ImageOff className="h-4 w-4 text-slate-300" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">{upsellItem.name}</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">+ {brl(Number(upsellItem.price))}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        addToCart(upsellItem);
                        toast({ title: 'Adicionado ao carrinho', description: upsellItem.name });
                      }}
                      className={styles.upsellAddBtn}
                      aria-label={`Adicionar ${upsellItem.name}`}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé */}
        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className="space-y-2">
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Subtotal</span>
                <span className={styles.summaryValue}>{brl(totalPrice)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Frete</span>
                <span className={styles.shippingValueText(isFreeShipping)}>
                  {isFreeShipping ? 'Grátis' : 'Calculado no checkout'}
                </span>
              </div>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <Pop value={totalPrice} className={styles.totalValue}>
                  {brl(totalPrice)}
                </Pop>
              </div>
            </div>

            <Button className={styles.checkoutBtn} onClick={handleCheckout}>
              <Lock className="w-4 h-4" aria-hidden="true" />
              Finalizar compra
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>

            <button
              onClick={() => { onClose(); navigate('/produtos'); }}
              className="w-full h-10 text-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              Continuar comprando
            </button>

            <p className="text-center text-xs text-slate-500">
              <span className="font-semibold text-emerald-600">5% OFF no PIX</span> · aplicado no checkout
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
