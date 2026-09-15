import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { preloadProducts } from "@/lib/preloadRoutes";
import { AnimatePresence, motion } from "framer-motion";
import { easing } from "@/lib/motion";

interface Slide {
  eyebrow: string;
  title: string;
  highlight: string;
  text: string;
  cta: string;
  to: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: "Novidades",
    title: "TECNOLOGIA QUE",
    highlight: "ACOMPANHA VOCÊ.",
    text: "Acessórios e eletrônicos escolhidos para o trabalho, o lazer e o dia a dia.",
    cta: "Comprar agora",
    to: "/produtos",
  },
  {
    eyebrow: "Entrega expressa",
    title: "RECEBA HOJE",
    highlight: "EM OSASCO/SP.",
    text: "Pedidos aprovados até as 16h saem para entrega no mesmo dia.",
    cta: "Ver produtos",
    to: "/produtos",
  },
  {
    eyebrow: "Pagamento",
    title: "5% DE DESCONTO",
    highlight: "PAGANDO NO PIX.",
    text: "Aprovação imediata. No cartão, parcele em até 10×.",
    cta: "Ver ofertas",
    to: "/produtos",
  },
];

const AUTOPLAY_MS = 6000;

export const TechHero: React.FC = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (i: number) =>
      setActive(((i % SLIDES.length) + SLIDES.length) % SLIDES.length),
    [],
  );

  // Autoplay: pausa no hover/foco e respeita quem prefere menos movimento.
  useEffect(() => {
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (paused || reduced) return;
    const t = setInterval(
      () => setActive((i) => (i + 1) % SLIDES.length),
      AUTOPLAY_MS,
    );
    return () => clearInterval(t);
  }, [paused]);

  const slide = SLIDES[active];

  return (
    <section
      className="pt-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carrossel"
      aria-label="Destaques da loja"
    >
      <div className="mx-auto max-w-5xl px-4">
        <div className="relative overflow-hidden rounded-2xl bg-[#0b1b3a] min-h-[260px] sm:min-h-[300px]">
          {/* Brilhos de fundo */}
          <div
            className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/25 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 opacity-[0.07]"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          <div className="relative z-10 p-6 sm:p-8 max-w-md">
            {/* O texto do slide entra pela direita e sai pela esquerda. */}
            <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.32, ease: easing.smooth }}
            >
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-300">
              {slide.eyebrow}
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold leading-tight text-white">
              {slide.title}
              <br />
              <span className="text-blue-400">{slide.highlight}</span>
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              {slide.text}
            </p>
            <Link
              to={slide.to}
              onPointerEnter={preloadProducts}
              onTouchStart={preloadProducts}
              className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
            >
              {slide.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            </motion.div>
            </AnimatePresence>

            {/* Indicadores — em fluxo, logo abaixo do CTA, para nunca cobri-lo.
                O botão preserva os 44px de alvo de toque (WCAG 2.5.5, regra
                global em index.css) e a barrinha visual vive dentro dele. */}
            <div className="mt-1 flex items-center gap-1">
              {SLIDES.map((s, i) => (
                <button
                  key={s.eyebrow}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Ir para o destaque ${i + 1}: ${s.eyebrow}`}
                  aria-current={i === active}
                  className="group h-11 px-1 flex items-center"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all ${
                      i === active
                        ? "w-6 bg-blue-400"
                        : "w-1.5 bg-white/40 group-hover:bg-white/70"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
