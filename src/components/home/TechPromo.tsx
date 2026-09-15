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
    <section className="pt-9">
      <Stagger gap={0.12} className="mx-auto max-w-5xl px-4 space-y-3">
        {/* ─── Banner de oferta ─── */}
        <StaggerItem>
        <div className="relative overflow-hidden rounded-[28px] bg-[#0b1b3a] p-6 sm:p-8">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-[320px] w-[320px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.55) 0%, rgba(11,27,58,0) 64%)' }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-flex h-[26px] items-center rounded-full bg-white/[0.12] px-2.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white">
                {badge}
              </span>
              <h2 className="mt-3 text-[28px] sm:text-[34px] font-extrabold leading-[0.95] tracking-[-0.04em] text-white">
                Turbine seu{' '}
                <span
                  className="text-blue-300"
                  style={{ fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif", fontStyle: 'italic', fontWeight: 400 }}
                >
                  setup.
                </span>
              </h2>
              <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">{text}</p>
              <Link
                to="/produtos"
                onPointerEnter={preloadProducts}
                onTouchStart={preloadProducts}
                className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
              >
                Explorar ofertas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <span className="hidden sm:flex h-24 w-24 shrink-0 rounded-full bg-white text-[#0b1b3a] flex-col items-center justify-center leading-none shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
              <span className="text-[9px] font-bold uppercase tracking-wider">Frete</span>
              <span className="text-sm font-extrabold mt-0.5">grátis</span>
              <span className="text-[9px] mt-0.5 opacity-80">R$ {freeShipping}+</span>
            </span>
          </div>
        </div>
        </StaggerItem>

        {/* ─── Selos de confiança ─── */}
        <StaggerItem>
        <ul className="grid grid-cols-3 gap-2.5">
          {[
            { Icon: Truck, title: 'Entrega rápida', desc: 'Mesmo dia em Osasco' },
            { Icon: Zap, title: '5% no PIX', desc: 'Aprovação imediata' },
            { Icon: ShieldCheck, title: 'Troca em 7 dias', desc: 'Garantia pelo CDC' },
          ].map(({ Icon, title, desc }) => (
            <li
              key={title}
              className="rounded-2xl border border-slate-200 p-3 flex flex-col items-center text-center gap-1.5"
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
