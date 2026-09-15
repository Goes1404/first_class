import React, { useState, useRef, useCallback } from 'react';
import { Truck, MapPin, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShippingOption {
  name: string;
  price: number;
  days: string;
  arrivalLabel: string;
  highlight?: boolean;
}

interface EdgeFunctionResponse {
  city: string;
  state: string;
  options: ShippingOption[];
  freeThreshold: number;
  error?: string;
}

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const ResultSkeleton = () => (
  <div aria-hidden="true" className="space-y-2">
    <div className="h-3 w-40 rounded skeleton" />
    <div className="h-14 rounded-xl skeleton" />
    <div className="h-14 rounded-xl skeleton" />
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  totalValue?: number;
  source?: string;
  /** Itens para cálculo de frete pelas dimensões reais (ex.: [{ id, quantity }]). */
  items?: { id: string; quantity: number }[];
}

export const ShippingCalculator: React.FC<Props> = ({
  totalValue = 0,
  source = 'web',
  items,
}) => {
  const [cep, setCep] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [options, setOptions] = useState<ShippingOption[] | null>(null);
  const [freeThreshold, setFreeThreshold] = useState(500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestCepRef = useRef('');

  const calculate = useCallback(async (rawCep: string) => {
    if (rawCep.length !== 8) return;
    latestCepRef.current = rawCep;
    setLoading(true);
    setError('');
    setOptions(null);
    setLocationLabel('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke<EdgeFunctionResponse>(
        'shipping-calculate',
        { body: { cep: rawCep, productValue: totalValue, source, items } },
      );

      // Ignora resposta atrasada se o usuário já digitou outro CEP
      if (latestCepRef.current !== rawCep) return;

      if (fnError || !data) {
        throw new Error(fnError?.message ?? 'Erro desconhecido');
      }
      if (data.error) {
        throw new Error(data.error);
      }

      setLocationLabel(`${data.city}, ${data.state}`);
      setOptions(data.options);
      setFreeThreshold(data.freeThreshold);
    } catch (err: unknown) {
      if (latestCepRef.current !== rawCep) return;
      const msg = err instanceof Error ? err.message : 'Erro ao calcular frete.';
      setError(msg);
    } finally {
      if (latestCepRef.current === rawCep) setLoading(false);
    }
  }, [totalValue, source, items]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    const masked = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw;
    setCep(masked);
    setOptions(null);
    setError('');
    setLocationLabel('');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (raw.length === 8) {
      debounceRef.current = setTimeout(() => calculate(raw), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      calculate(cep.replace(/\D/g, ''));
    }
  };

  const handleRetry = () => calculate(cep.replace(/\D/g, ''));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Truck className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
        <span id="shipping-calc-label" className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Calcular frete
        </span>
      </div>

      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
        <input
          type="text"
          inputMode="numeric"
          value={cep}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="00000-000"
          aria-labelledby="shipping-calc-label"
          aria-label="CEP para cálculo de frete"
          aria-busy={loading}
          aria-describedby={error ? 'shipping-error' : undefined}
          autoComplete="postal-code"
          className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 tracking-widest outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
        />
        {loading && (
          <RefreshCw className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 animate-spin" aria-hidden="true" />
        )}
        {!loading && options && (
          <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" aria-hidden="true" />
        )}
        {!loading && error && (
          <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" aria-hidden="true" />
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2" role="alert">
          <p id="shipping-error" className="text-rose-600 text-xs font-medium flex-1">{error}</p>
          <button
            onClick={handleRetry}
            aria-label="Tentar novamente"
            className="h-9 w-9 rounded-full flex items-center justify-center text-rose-600 hover:bg-rose-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {loading && <ResultSkeleton />}

      <div role="region" aria-live="polite" aria-label="Opções de frete">
        {options && (
          <div className="space-y-2">
            {locationLabel && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                Entregando em <span className="font-semibold text-slate-900">{locationLabel}</span>
              </p>
            )}

            {options.map((opt, i) => (
              <div
                key={i}
                className={`flex items-start justify-between gap-3 px-4 py-3 rounded-xl border ${
                  opt.highlight ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${opt.highlight ? 'text-blue-700' : 'text-slate-900'}`}>{opt.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{opt.days}</p>
                  <p className="text-xs text-slate-500">{opt.arrivalLabel}</p>
                </div>
                <span
                  className={`text-sm font-bold tabular-nums shrink-0 ${opt.price === 0 ? 'text-emerald-600' : 'text-slate-900'}`}
                >
                  {opt.price === 0 ? 'Grátis' : brl(opt.price)}
                </span>
              </div>
            ))}

            {totalValue < freeThreshold && (
              <p className="text-xs text-slate-400 text-center pt-1">
                Frete grátis acima de <span className="font-semibold text-slate-600">{brl(freeThreshold)}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
