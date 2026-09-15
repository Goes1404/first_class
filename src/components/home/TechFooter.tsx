import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Instagram } from 'lucide-react';
import { STORE } from '@/config/store';
import { WHATSAPP_LINK } from '@/config/constants';

const LINKS = [
  { label: 'Produtos', to: '/produtos' },
  { label: 'Contato', to: '/contato' },
  { label: 'Privacidade', to: '/privacidade' },
  { label: 'Termos', to: '/termos' },
];

export const TechFooter: React.FC = () => (
  <footer className="mt-10 bg-white border-t border-slate-200">
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="flex flex-col leading-none">
          <span className="text-[11px] font-extrabold tracking-[0.26em] text-slate-900 uppercase">{STORE.name}</span>
          <span className="mt-1 text-[11px] font-medium text-slate-500">Acessórios · Tecnologia</span>
        </span>
        <div className="flex items-center gap-2">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Falar no WhatsApp"
            className="h-9 w-9 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 flex items-center justify-center transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <a
            href={STORE.contact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram da loja"
            className="h-9 w-9 rounded-full bg-slate-100 hover:bg-pink-50 hover:text-pink-600 text-slate-600 flex items-center justify-center transition-colors"
          >
            <Instagram className="h-4 w-4" />
          </a>
        </div>
      </div>

      <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="Links do rodapé">
        {LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <p className="mt-5 text-[11px] text-slate-400 leading-relaxed">
        {STORE.address.full} · © {new Date().getFullYear()} {STORE.name}. Todos os direitos reservados.
      </p>
    </div>
  </footer>
);
