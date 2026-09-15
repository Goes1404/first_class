import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, ShoppingCart, X, Zap, Search, SlidersHorizontal } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { STORE } from '@/config/store';

const MENU_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Produtos', to: '/produtos' },
  { label: 'Cupons', to: '/cupons' },
  { label: 'Favoritos', to: '/favoritos' },
  { label: 'Meus pedidos', to: '/pedidos' },
  { label: 'Minha conta', to: '/perfil' },
  { label: 'Contato', to: '/contato' },
];

/** Contador nas bolhas de sino/carrinho. Some quando zero. */
const Badge: React.FC<{ count: number }> = ({ count }) =>
  count > 0 ? (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
      {count > 9 ? '9+' : count}
    </span>
  ) : null;

export const TechTopBar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const cartCount = getTotalItems();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/produtos?q=${encodeURIComponent(q)}` : '/produtos');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-4">
        {/* ─── Linha 1: menu · logo · ações ─── */}
        <div className="h-16 grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            className="p-2 -ml-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link to="/" className="flex flex-col items-center leading-none min-w-0">
            <span className="flex items-center gap-1.5">
              <Zap className="h-5 w-5 text-blue-600 fill-blue-600 shrink-0" />
              <span className="font-extrabold tracking-tight text-slate-900 text-lg sm:text-xl truncate">
                {STORE.name}
              </span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.25em] text-blue-600 mt-1">
              ACESSÓRIOS · TECNOLOGIA
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              to="/pedidos"
              aria-label="Notificações e pedidos"
              className="relative p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
            </Link>
            <Link
              to="/checkout"
              aria-label={`Carrinho com ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
              className="relative p-2 -mr-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <Badge count={cartCount} />
            </Link>
          </div>
        </div>

        {/* ─── Linha 2: busca ─── */}
        <form onSubmit={submitSearch} className="pb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar acessórios, eletrônicos..."
              aria-label="Buscar produtos"
              className="w-full h-11 pl-10 pr-4 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <Link
            to="/produtos"
            aria-label="Filtros"
            className="h-11 w-11 shrink-0 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Link>
        </form>
      </div>

      {/* ─── Drawer do menu ─── */}
      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-slate-900/50"
          />
          <nav className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-white shadow-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="flex items-center gap-1.5 font-extrabold text-slate-900">
                <Zap className="h-5 w-5 text-blue-600 fill-blue-600" />
                {STORE.name}
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
                className="p-2 -mr-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="space-y-1">
              {MENU_LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};
