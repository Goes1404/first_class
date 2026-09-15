import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, User, Menu, Search, Zap, Home, ShoppingBag, Phone, X,
  Footprints, Shirt, Headphones,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CartModal } from './CartModal';
import { Pop } from '@/components/animations/Pop';
import { spring, easing } from '@/lib/motion';
import { STORE } from '@/config/store';

const navLinks = [
  { label: 'Início', path: '/', icon: Home },
  { label: 'Produtos', path: '/produtos', icon: ShoppingBag },
  { label: 'Tênis', path: '/tenis', icon: Footprints },
  { label: 'Roupas', path: '/roupas', icon: Shirt },
  { label: 'Fones', path: '/fones', icon: Headphones },
  { label: 'Contato', path: '/contato', icon: Phone },
];

/** Atalhos da busca: as abas que existem de verdade, não categorias chutadas. */
const searchShortcuts = [
  { label: 'Tênis', to: '/tenis' },
  { label: 'Roupas', to: '/roupas' },
  { label: 'Fones', to: '/fones' },
  { label: 'Ver tudo', to: '/produtos' },
];

const iconBtn =
  'relative h-11 w-11 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all';

export const Header: React.FC = () => {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBtnRef = useRef<HTMLButtonElement>(null);
  const wasSearchOpen = useRef(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Foca o input ao abrir; devolve o foco ao botão da lupa ao fechar
  useEffect(() => {
    if (isSearchOpen) {
      wasSearchOpen.current = true;
      const t = setTimeout(() => searchInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    if (wasSearchOpen.current) {
      wasSearchOpen.current = false;
      searchBtnRef.current?.focus();
    }
  }, [isSearchOpen]);

  // Fecha a busca no Escape
  useEffect(() => {
    if (!isSearchOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSearchOpen]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setIsSearchOpen(false);
    navigate(q ? `/produtos?q=${encodeURIComponent(q)}` : '/produtos');
    setSearchQuery('');
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[padding,background-color,box-shadow,border-color] duration-300 ${
        isScrolled
          ? 'py-2 bg-white/90 backdrop-blur-xl border-slate-200 shadow-[0_4px_24px_rgba(15,23,42,0.06)]'
          : 'py-3 bg-white/85 backdrop-blur-md border-transparent'
      }`}
    >
      {/* Pular direto ao conteúdo (teclado/leitor de tela) */}
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-5 focus:py-3 focus:rounded-full text-xs font-bold"
      >
        Pular para o conteúdo
      </a>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Marca */}
        <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0">
          <Zap className="h-6 w-6 text-blue-600 fill-blue-600 shrink-0" aria-hidden="true" />
          <span className="flex flex-col leading-none min-w-0">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 truncate">{STORE.name}</span>
            <span className="hidden sm:block mt-0.5 text-[9px] font-semibold tracking-[0.25em] text-blue-600">
              ACESSÓRIOS · TECNOLOGIA
            </span>
          </span>
        </Link>

        {/* Navegação desktop — um sublinhado só, que desliza entre os links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Principal">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                aria-current={active ? 'page' : undefined}
                className={`relative py-2 text-[13px] font-semibold transition-colors ${
                  active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="header-underline"
                    transition={spring.soft}
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-blue-600"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-0.5">
          <button
            ref={searchBtnRef}
            onClick={() => setIsSearchOpen(true)}
            className={iconBtn}
            aria-label="Buscar produtos"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className={iconBtn}
            aria-label={`Carrinho — ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Pop
                value={totalItems}
                className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
              >
                {totalItems > 9 ? '9+' : totalItems}
              </Pop>
            )}
          </button>

          <Link to="/login" className={`${iconBtn} hidden md:flex`} aria-label="Minha conta">
            <User className="h-5 w-5" />
          </Link>

          {/* Menu mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <button className={`${iconBtn} md:hidden`} aria-label="Abrir menu">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-white border-l border-slate-200 p-0">
              <SheetHeader className="p-5 border-b border-slate-200">
                <SheetTitle className="text-left">
                  <span className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600 fill-blue-600" aria-hidden="true" />
                    <span className="text-base font-extrabold text-slate-900">{STORE.name}</span>
                  </span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-3 gap-1" aria-label="Menu">
                {[...navLinks, { label: 'Minha conta', path: '/login', icon: User }].map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 h-12 px-3 rounded-xl text-sm font-semibold transition-colors ${
                        active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <link.icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <p className="absolute bottom-6 inset-x-0 text-center text-[11px] text-slate-400">
                {STORE.name} © {new Date().getFullYear()}
              </p>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ── Busca ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Buscar produtos"
              className="absolute top-0 inset-x-0 bg-white border-b border-slate-200 shadow-xl p-4 sm:p-6"
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.26, ease: easing.smooth }}
              onClick={(e) => e.stopPropagation()}
              style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
            >
              <form onSubmit={submitSearch} className="max-w-screen-md mx-auto flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    inputMode="search"
                    enterKeyHint="search"
                    aria-label="Buscar produtos"
                    placeholder="O que você procura? (ex: capa, fone, carregador)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="shrink-0 h-12 px-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold active:scale-95 transition-all"
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  aria-label="Fechar busca"
                  className="shrink-0 h-12 w-12 rounded-full border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </form>

              <div className="max-w-screen-md mx-auto mt-3 flex flex-wrap gap-2">
                {searchShortcuts.map((s) => (
                  <button
                    key={s.to}
                    type="button"
                    onClick={() => { setIsSearchOpen(false); navigate(s.to); }}
                    className="h-9 px-3.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-blue-400 hover:text-blue-700 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};
