import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { staggerContainer, staggerItem, staggerScale } from '@/lib/motion';

type ContainerTag = 'div' | 'ul' | 'section';
type ItemTag = 'div' | 'li';

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  as?: ContainerTag;
  /** Fração visível para disparar (0–1). */
  amount?: number;
  delay?: number;
  gap?: number;
  'aria-label'?: string;
}

/**
 * Escalona a entrada dos filhos quando o bloco entra na viewport.
 * Cada filho que deve animar vem embrulhado em <StaggerItem>.
 */
export const Stagger: React.FC<StaggerProps> = ({
  children, className, as = 'div', amount = 0.15, delay = 0, gap = 0.06, ...rest
}) => {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      variants={staggerContainer(delay, gap)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  as?: ItemTag;
  /** 'up' sobe e aparece; 'scale' cresce do centro. */
  kind?: 'up' | 'scale';
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className, as = 'div', kind = 'up' }) => {
  const Tag = motion[as] as typeof motion.div;
  const variants: Variants = kind === 'scale' ? staggerScale : staggerItem;
  return (
    <Tag className={className} variants={variants}>
      {children}
    </Tag>
  );
};
