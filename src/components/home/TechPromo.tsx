import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Zap } from 'lucide-react';
import { preloadProducts } from '@/lib/preloadRoutes';
import { useAppSettings } from '@/hooks/useProducts';
import { Stagger, StaggerItem } from '@/components/animations/Stagger';

export const TechPromo: React.FC = () => {
  const { data: settings } = useAppSettings();
  const badge = settings?.offer_banner_badge || 'Oferta especial';
  const text = settings?.offer_banner_text || 'Acessórios selecionados com desconto para montar seu setup.';
  const freeShipping = settings?.free_shipping_threshold || '500';

  return (
    <section className="pt-8">
      <Stagger gap={0.12} className="mx-auto max-w-5xl px-4 space-y-3">
        {/* ─── Banner de oferta ─── */}
        <StaggerItem>
        <div className="relative overflow-hidden rounded-2xl bg-[#0b1b3a] p-6 sm:p-7">
          <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-blue-500/25 blur-3xl" aria-hidden="true" />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-300">
                {badge}
              </span>
              <h2 className="mt-1.5 text-xl sm:text-2xl font-extrabold text-white leading-tight">
                Turbine seu setup
              </h2>
              <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">{text}</p>
              <Link
                to="/produtos"
                onPointerEnter={preloadProducts}
                onTouchStart={preloadProducts}
                className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
              >
                Explorar ofertas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <span className="hidden sm:flex h-20 w-20 shrink-0 rounded-full bg-blue-600 flex-col items-center justify-center text-white leading-none">
              <span className="text-[9px] font-bold uppercase tracking-wider">Frete</span>
              <span className="text-sm font-extrabold mt-0.5">grátis</span>
              <span className="text-[9px] mt-0.5 opacity-80">R$ {freeShipping}+</span>
            </span>
          </div>
        </div>
        </StaggerItem>

        {/* ─── Selos de confiança ─── */}
        <StaggerItem>
        <ul className="grid grid-cols-3 gap-3">
          {[
            { Icon: Truck, title: 'Entrega rápida', desc: 'Mesmo dia em Osasco' },
            { Icon: Zap, title: '5% no PIX', desc: 'Aprovação imediata' },
            { Icon: ShieldCheck, title: 'Troca em 7 dias', desc: 'Garantia pelo CDC' },
          ].map(({ Icon, title, desc }) => (
            <li
              key={title}
              className="rounded-2xl bg-white border border-slate-200 p-3 flex flex-col items-center text-center gap-1.5"
            >
              <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <span className="text-[11px] font-bold text-slate-900 leading-tight">{title}</span>
              <span className="text-[10px] text-slate-500 leading-tight">{desc}</span>
            </li>
          ))}
        </ul>
        </StaggerItem>
      </Stagger>
    </section>
  );
};
