import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, Send, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { spring } from '@/lib/motion';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    full_name: string;
    avatar_url: string;
  };
}

interface ProductReviewsProps {
  productId: string;
}

const Stars: React.FC<{ value: number; className?: string }> = ({ value, className = 'w-4 h-4' }) => (
  <span className="flex items-center gap-0.5" aria-label={`${value} de 5`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`${className} ${s <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
        aria-hidden="true"
      />
    ))}
  </span>
);

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*, user:profiles(full_name, avatar_url)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) return [];
      return data as Review[];
    },
  });

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Faça login para deixar uma avaliação.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Escreva um comentário antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment,
        });

      if (error) throw error;

      toast.success('Avaliação enviada. Obrigado!');
      setComment('');
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    } catch (error: any) {
      toast.error('Erro ao enviar avaliação: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mt-16 space-y-8" aria-labelledby="avaliacoes-titulo">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <h2 id="avaliacoes-titulo" className="text-2xl font-bold text-slate-900 tracking-tight">Avaliações</h2>
          <div className="flex items-center gap-3">
            <Stars value={averageRating} className="w-5 h-5" />
            <span className="text-sm text-slate-500">
              {reviews.length > 0 ? (
                <>
                  <span className="font-semibold text-slate-900">{averageRating.toFixed(1)}</span> · {reviews.length}{' '}
                  {reviews.length === 1 ? 'avaliação' : 'avaliações'}
                </>
              ) : (
                'Ainda sem avaliações'
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Formulário — no mobile vem depois, para a leitura vir primeiro */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          {user ? (
            <form
              onSubmit={submitReview}
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 lg:sticky lg:top-28"
            >
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">Avalie este produto</h3>
                <div className="flex items-center gap-1" role="radiogroup" aria-label="Nota">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <motion.button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={rating === s}
                      aria-label={`${s} ${s === 1 ? 'estrela' : 'estrelas'}`}
                      onClick={() => setRating(s)}
                      whileTap={{ scale: 0.85 }}
                      transition={spring.snappy}
                      className="h-11 w-11 flex items-center justify-center rounded-full hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <Star className={`w-7 h-7 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    </motion.button>
                  ))}
                </div>
              </div>

              <Textarea
                placeholder="Como foi a sua experiência com o produto?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-slate-100 border-slate-200 rounded-xl min-h-[130px] p-4 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-100 focus-visible:border-blue-500 resize-none"
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Enviando...' : 'Publicar avaliação'}
                <Send className="w-4 h-4" aria-hidden="true" />
              </Button>
            </form>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                <MessageSquare className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Avalie este produto</h3>
              <p className="text-sm text-slate-500">Entre na sua conta para deixar uma avaliação.</p>
              <Button
                variant="outline"
                className="h-11 px-6 rounded-full border-slate-200 text-slate-900 font-semibold hover:bg-white"
                onClick={() => (window.location.href = '/login')}
              >
                Entrar
              </Button>
            </div>
          )}
        </div>

        {/* Lista — primeiro no mobile */}
        <div className="lg:col-span-7 space-y-3 order-1 lg:order-2">
          {isLoading ? (
            [1, 2].map((i) => <div key={i} className="h-36 rounded-2xl skeleton" aria-hidden="true" />)
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <article key={review.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden">
                      {review.user?.avatar_url ? (
                        <img src={review.user.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="w-5 h-5" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {review.user?.full_name?.trim() || 'Cliente'}
                      </h4>
                      <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        {format(new Date(review.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <Stars value={review.rating} className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
              </article>
            ))
          ) : (
            <div className="py-14 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-sm text-slate-500">Seja o primeiro a avaliar este produto.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
