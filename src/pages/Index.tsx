import React from 'react';
import SEO from '@/components/SEO';
import { useAnalytics } from '@/hooks/useAnalytics';
import { TechTopBar } from '@/components/home/TechTopBar';
import { TechHero } from '@/components/home/TechHero';
import { TechCategories } from '@/components/home/TechCategories';
import { TechTrending } from '@/components/home/TechTrending';
import { TechPromo } from '@/components/home/TechPromo';
import { TechFooter } from '@/components/home/TechFooter';

/**
 * Home no padrão Vitrine: barra superior com busca, hero editorial com os
 * destaques como holofote, coleções com foto, vitrine "em alta" e banner de oferta.
 *
 * O visual claro/azul vive nos componentes de `components/home` e não toca os
 * tokens globais, então as demais páginas seguem com o tema atual.
 */
const Index: React.FC = () => {
  const { usePageVisit } = useAnalytics();
  usePageVisit('home');

  return (
    // Fundo claro explícito no wrapper: impede que o tema escuro global vaze.
    <div className="min-h-screen overflow-x-clip bg-white pb-28">
      <SEO />
      <TechTopBar />

      <main>
        <TechHero />
        <TechCategories />
        <TechTrending />
        <TechPromo />
      </main>

      <TechFooter />
    </div>
  );
};

export default Index;
