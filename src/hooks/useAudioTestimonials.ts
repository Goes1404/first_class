import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Testimonial {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  author: string;
  avatar?: string;
  productName?: string;
}

/**
 * Avaliações reais dos produtos informados, das melhores para as piores.
 * Serve a faixa de depoimentos da página de áudio — nada é inventado, então a
 * seção some enquanto ninguém tiver avaliado.
 */
export const useProductTestimonials = (productIds: string[], limit = 6) =>
  useQuery<Testimonial[]>({
    queryKey: ['product-testimonials', [...productIds].sort().join(','), limit],
    enabled: productIds.length > 0,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('id, rating, comment, created_at, product:products(name), user:profiles(full_name, avatar_url)')
        .in('product_id', productIds)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];

      return (data as any[]).map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        author: r.user?.full_name?.trim() || 'Cliente',
        avatar: r.user?.avatar_url || undefined,
        productName: r.product?.name,
      }));
    },
  });
