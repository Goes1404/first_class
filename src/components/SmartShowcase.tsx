import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard, ProductCardSkeleton } from './ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SmartShowcaseProps {
  title?: string;
  subtitle?: string;
  category?: string;
  excludeProductId?: string;
  limit?: number;
  mode?: 'trending' | 'related' | 'personalized';
}

export const SmartShowcase: React.FC<SmartShowcaseProps> = ({
  title = 'Em alta',
  subtitle = 'Os produtos mais procurados da loja.',
  category,
  excludeProductId,
  limit = 4,
  mode = 'trending',
}) => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['smart-showcase', mode, category, excludeProductId],
    queryFn: async () => {
      // Filtro e ordenação no servidor: busca só as colunas que o card usa
      // e apenas `limit` linhas (antes: 12 linhas completas para exibir 4).
      let query = supabase
        .from('products')
        .select('id,name,price,cost,image,images,stock,category,is_featured,description');
      if (category) query = query.eq('category', category);
      if (excludeProductId) query = query.neq('id', excludeProductId);
      if (mode === 'trending') query = query.order('is_featured', { ascending: false });
      const { data, error } = await query.limit(limit);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded skeleton" />
          <div className="h-7 w-56 rounded skeleton" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(limit)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            {mode === 'trending' ? 'Em alta' : 'Relacionados'}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <Link
          to="/produtos"
          className="shrink-0 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Ver todos <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
