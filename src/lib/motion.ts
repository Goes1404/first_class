import { useEffect, useState } from 'react';

/** Detecta `prefers-reduced-motion` — todas as animações respeitam isso. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/** Detecta breakpoint atual de forma reativa. */
export function useBreakpoint() {
  const [bp, setBp] = useState<'sm' | 'md' | 'lg' | 'xl'>(() => {
    if (typeof window === 'undefined') return 'lg';
    const w = window.innerWidth;
    return w < 640 ? 'sm' : w < 768 ? 'md' : w < 1280 ? 'lg' : 'xl';
  });
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setBp(w < 640 ? 'sm' : w < 768 ? 'md' : w < 1280 ? 'lg' : 'xl');
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return bp;
}

export const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

/** Easing curves de "luxo" (cubic-bezier) reaproveitadas no projeto. */
export const easing = {
  smooth: [0.22, 1, 0.36, 1] as const,
  expo: [0.16, 1, 0.3, 1] as const,
  brand: [0.77, 0, 0.18, 1] as const,
};

/* ─── Sistema de movimento compartilhado ─────────────────────────────────────
   Uma vocabulário só para o site inteiro: molas com a mesma "personalidade",
   e variantes de entrada que os componentes reutilizam em vez de improvisar.
   `MotionConfig reducedMotion="user"` no App faz tudo isto respeitar o
   sistema operacional sem cada componente checar por conta própria. */

import type { Transition, Variants } from 'framer-motion';

export const spring = {
  /** Toques e seleções: responde rápido, quase sem oscilar. */
  snappy: { type: 'spring', stiffness: 520, damping: 32, mass: 0.8 } as Transition,
  /** Elementos que deslizam de lugar (indicador de aba, layout). */
  soft: { type: 'spring', stiffness: 260, damping: 28 } as Transition,
  /** Badge que "pula" ao mudar de valor. */
  pop: { type: 'spring', stiffness: 700, damping: 22 } as Transition,
} as const;

/** Container que escalona a entrada dos filhos. */
export const staggerContainer = (delay = 0, gap = 0.06): Variants => ({
  hidden: {},
  show: { transition: { delayChildren: delay, staggerChildren: gap } },
});

/** Item de entrada: sobe 14px e aparece. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easing.smooth } },
};

/** Entrada por escala — para chips e círculos. */
export const staggerScale: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: spring.snappy },
};

/** Hover/press de card de produto. */
export const cardHover = { y: -4, transition: spring.soft };
export const cardTap = { scale: 0.985, transition: spring.snappy };
