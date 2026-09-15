import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronsRight, ShoppingBag, Check } from 'lucide-react';

const KNOB = 56;
const PAD = 6;
/** Fração da pista a partir da qual o gesto conta como confirmado. */
const THRESHOLD = 0.75;

interface Props {
  label: string;
  disabled?: boolean;
  disabledLabel?: string;
  onConfirm: () => void;
}

/**
 * Botão "arraste para confirmar".
 *
 * O arrasto é o gesto principal, mas não é o único: o botão também responde a
 * clique e a Enter/Espaço, senão a compra ficaria fora do alcance de quem usa
 * teclado ou leitor de tela.
 */
export const SlideToCart: React.FC<Props> = ({ label, disabled, disabledLabel, onConfirm }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  /** Distingue um arrasto de um clique: o navegador dispara click depois do
   *  pointerup mesmo quando o dedo andou, e sem isso um arrasto curto
   *  (abaixo do limite) acabaria confirmando pelo atalho de clique. */
  const movedRef = useRef(false);

  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);

  const maxX = useCallback(
    () => Math.max(0, (trackRef.current?.clientWidth ?? 0) - KNOB - PAD * 2),
    [],
  );

  const setKnob = useCallback((v: number) => {
    xRef.current = v;
    setX(v);
  }, []);

  const finish = useCallback(() => {
    setDone(true);
    setKnob(maxX());
    onConfirm();
    window.setTimeout(() => {
      setDone(false);
      setKnob(0);
    }, 1100);
  }, [maxX, onConfirm, setKnob]);

  useEffect(() => {
    if (!dragging) return;

    const move = (e: PointerEvent) => {
      const track = trackRef.current;
      if (!track) return;
      const left = track.getBoundingClientRect().left + PAD;
      const next = Math.min(Math.max(0, e.clientX - left - KNOB / 2), maxX());
      if (next > 4) movedRef.current = true;
      setKnob(next);
    };
    const up = () => {
      setDragging(false);
      const limit = maxX();
      if (limit > 0 && xRef.current / limit >= THRESHOLD) finish();
      else setKnob(0);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [dragging, finish, maxX, setKnob]);

  if (disabled) {
    return (
      <div
        className="h-[68px] rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center"
        aria-disabled="true"
      >
        <span className="text-sm font-bold text-slate-400">{disabledLabel ?? label}</span>
      </div>
    );
  }

  const progress = maxX() > 0 ? x / maxX() : 0;

  return (
    <div
      ref={trackRef}
      className="relative h-[68px] rounded-full bg-slate-900 overflow-hidden select-none"
      style={{ padding: PAD }}
    >
      <span
        className="absolute inset-y-0 left-0 bg-blue-600 transition-[width] duration-150"
        style={{ width: `${progress * 100}%` }}
        aria-hidden="true"
      />
      <span className="absolute inset-0 flex items-center justify-center gap-2 pl-10 pointer-events-none">
        <ChevronsRight className={`h-5 w-5 ${done ? 'opacity-0' : 'text-white/40'}`} aria-hidden="true" />
        <span className="text-[15px] font-bold text-white">{done ? 'Adicionado!' : label}</span>
      </span>
      <button
        type="button"
        onPointerDown={(e) => {
          (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
          movedRef.current = false;
          setDragging(true);
        }}
        onClick={() => {
          // Atalho de clique/teclado — só quando não houve arrasto.
          if (movedRef.current) {
            movedRef.current = false;
            return;
          }
          if (!done) finish();
        }}
        aria-label={label}
        className="relative z-10 rounded-full bg-white shadow-lg flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
        style={{
          width: KNOB,
          height: KNOB,
          transform: `translateX(${x}px)`,
          transition: dragging ? 'none' : 'transform .25s ease',
        }}
      >
        {done ? (
          <Check className="h-6 w-6 text-blue-600" />
        ) : (
          <ShoppingBag className="h-6 w-6 text-slate-900" />
        )}
      </button>
    </div>
  );
};
