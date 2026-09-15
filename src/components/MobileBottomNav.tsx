import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingBag, Tag, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { Pop } from '@/components/animations/Pop';
import { spring } from '@/lib/motion';

const MotionLink = motion(Link);

const tabs = [
  { label: 'Início', path: '/', icon: Home },
  { label: 'Produtos', path: '/produtos', icon: LayoutGrid },
  { label: 'Cupons', path: '/cupons', icon: Tag },
  { label: 'Conta', path: '/perfil', icon: User },
] as const;

/** Bottom nav mobile no estilo da home tech: barra branca, quatro abas e o
 *  carrinho num botão central elevado. */
export const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  // Esconde onde já existe barra de ação fixa própria (evita colisão com o CTA).
  // /tenis, /roupas e /eletronicos listam e mantêm a nav; /<grupo>/<id> é a tela de compra
  // e tem a sua própria barra fixa.
  const hidden =
    pathname.startsWith('/admin') ||
    pathname === '/checkout' ||
    pathname.startsWith('/produto/') ||
    /^\/(tenis|roupas|eletronicos)\/.+/.test(pathname);
  if (hidden) return null;

  const isActive = (path: string) => (path === '/' ? pathname === '/' : pathname.startsWith(path));

  // Páginas de tema escuro: a barra branca padrão destoaria por cima delas.
  const dark = pathname.startsWith('/fones');
  const idle = dark ? 'text-white/40' : 'text-slate-400';

  const renderTab = (tab: (typeof tabs)[number]) => {
    const active = isActive(tab.path);
    const Icon = tab.icon;
    return (
      <Link
        key={tab.path}
        to={tab.path}
        aria-current={active ? 'page' : undefined}
        className="relative flex flex-col items-center justify-center gap-1 flex-1 py-2 active:scale-95 transition-transform"
      >
        {/* Um só indicador, que desliza entre as abas em vez de piscar. */}
        {active && (
          <motion.span
            layoutId="nav-active"
            transition={spring.soft}
            className="absolute top-0 h-[3px] w-8 rounded-full bg-blue-600"
            aria-hidden="true"
          />
        )}
        <Icon className={`h-5 w-5 transition-colors ${active ? 'text-blue-600' : idle}`} />
        <span
          className={`text-[10px] font-semibold transition-colors ${active ? 'text-blue-600' : idle}`}
        >
          {tab.label}
        </span>
      </Link>
    );
  };

  return (
    <nav
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t ${
        dark ? 'bg-[#0b0b12] border-white/10' : 'bg-white border-slate-200'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Navegação mobile"
    >
      <div className="relative flex items-stretch px-2">
        {tabs.slice(0, 2).map(renderTab)}

        {/* Espaçador sob o botão central flutuante */}
        <div className="w-16 shrink-0" aria-hidden="true" />

        {tabs.slice(2).map(renderTab)}

        <MotionLink
          to="/checkout"
          whileTap={{ scale: 0.9 }}
          transition={spring.snappy}
          aria-label={`Carrinho com ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
          className={`absolute left-1/2 -translate-x-1/2 -top-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 active:scale-95 transition-all ring-4 ${dark ? 'ring-[#0b0b12]' : 'ring-white'}`}
        >
          <ShoppingBag className="h-6 w-6" />
          {totalItems > 0 && (
            <Pop
              value={totalItems}
              className={`absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ${
                dark ? 'ring-[#0b0b12]' : 'ring-white'
              }`}
            >
              {totalItems > 9 ? '9+' : totalItems}
            </Pop>
          )}
        </MotionLink>
      </div>
    </nav>
  );
};
