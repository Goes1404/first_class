import React from 'react';
import { motion } from 'framer-motion';
import { spring } from '@/lib/motion';

interface PopProps {
  /** Quando muda, o conteúdo remonta com a mola — o badge "pula". */
  value: string | number;
  className?: string;
  children: React.ReactNode;
}

/** Badge que pula ao mudar de valor (contador do carrinho). */
export const Pop: React.FC<PopProps> = ({ value, className, children }) => (
  <motion.span
    key={String(value)}
    className={className}
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={spring.pop}
  >
    {children}
  </motion.span>
);
