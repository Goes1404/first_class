import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { INSTAGRAM_URL, WHATSAPP_NUMBER, WHATSAPP_LINK } from '@/config/constants';
import { STORE } from '@/config/store';
import { Instagram, MessageCircle, Mail, MapPin, Zap, Send, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrackingInText } from '@/components/animations/TrackingIn';
import { spring } from '@/lib/motion';

const WHATSAPP = `${WHATSAPP_LINK}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es!`;

const footerLinks = [
  { label: 'Início', to: '/' },
  { label: 'Produtos', to: '/produtos' },
  { label: 'Tênis', to: '/tenis' },
  { label: 'Roupas', to: '/roupas' },
  { label: 'Fones', to: '/fones' },
  { label: 'Contato', to: '/contato' },
  { label: 'Minha conta', to: '/perfil' },
];

export const Footer: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();

  // O letreiro cresce de 0.85 → 1 conforme a seção entra na tela
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end end'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)) {
      toast({
        title: 'E-mail inválido',
        description: 'Verifique o endereço informado e tente novamente.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await (supabase as any).from('newsletter').insert([{ email: normalized }]);
      if (error) throw error;
      toast({
        title: 'Inscrição realizada!',
        description: 'Você vai receber as novidades e ofertas por e-mail.',
      });
      setEmail('');
    } catch (error: any) {
      const isDuplicate = error?.code === '23505';
      toast({
        title: isDuplicate ? 'E-mail já cadastrado' : 'Erro ao inscrever',
        description: isDuplicate ? 'Este e-mail já está na nossa lista.' : 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="cv-auto bg-slate-50 border-t border-slate-200 text-slate-500 relative overflow-hidden">
      {/* ═══ Chamada final ═══ */}
      <div
        ref={sectionRef}
        className="relative w-full overflow-hidden border-b border-slate-200 py-20 md:py-32 flex flex-col items-center justify-center text-center"
      >
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <span className="text-[30vw] font-extrabold text-slate-900 leading-none" style={{ opacity: 0.035 }}>
            JR
          </span>
        </div>
        <div
          className="absolute w-[520px] h-[320px] rounded-full bg-blue-500/10 blur-[110px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />

        <motion.div style={prefersReducedMotion ? {} : { scale, opacity }} className="relative z-10 px-4">
          <h2
            className="font-extrabold text-slate-900 leading-[0.9] tracking-[-0.04em]"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)' }}
          >
            <TrackingInText text="PRONTO PARA" className="block" stagger={0.04} delay={0} />
            <TrackingInText
              text="COMEÇAR?"
              className="block"
              letterClassName="text-blue-600"
              stagger={0.05}
              delay={0.3}
            />
          </h2>
        </motion.div>

        <p className="relative z-10 mt-5 max-w-md mx-auto text-base text-slate-500 leading-relaxed">
          Fale com a nossa equipe ou explore o catálogo.
        </p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 mt-10 relative z-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
            <motion.span
              className="flex items-center justify-center gap-2.5 h-14 px-8 rounded-full bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25"
              whileHover={prefersReducedMotion ? {} : { y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={spring.snappy}
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp
            </motion.span>
          </a>
          <Link to="/produtos">
            <motion.span
              className="flex items-center justify-center gap-2.5 h-14 px-8 rounded-full bg-white border border-slate-200 text-slate-900 font-bold text-sm hover:border-blue-300 transition-colors"
              whileHover={prefersReducedMotion ? {} : { y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={spring.snappy}
            >
              <ShoppingBag className="w-5 h-5" />
              Ver produtos
            </motion.span>
          </Link>
        </motion.div>
      </div>

      {/* ═══ Conteúdo do rodapé ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8 relative z-10">
        {/* Newsletter */}
        <div className="mb-14 p-6 md:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left space-y-2">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Fique por dentro</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Lançamentos e ofertas da {STORE.name}, direto no seu e-mail. Sem spam.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="w-full lg:max-w-md flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-11 rounded-full bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-100 focus-visible:border-blue-500"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2"
              >
                {isLoading ? '...' : 'Inscrever'}
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>

        {/* Colunas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-600 fill-blue-600" aria-hidden="true" />
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">{STORE.name}</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-md text-slate-500">
              Acessórios e produtos variados. Preços justos, pagamento com PIX e cartão, entrega rápida em
              Osasco/SP e para todo o Brasil.
            </p>
            <div className="flex gap-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da loja"
                className="h-11 w-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-pink-600 hover:border-pink-200 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp da loja"
                className="h-11 w-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Navegação</h4>
            <nav className="flex flex-col gap-2.5" aria-label="Links do rodapé">
              {footerLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors w-fit"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Loja</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 shrink-0" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-slate-600">
                  {STORE.address.street}
                  <br />
                  {STORE.address.city} - {STORE.address.state}
                  <br />
                  {STORE.address.zip}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600 shrink-0" aria-hidden="true" />
                <p className="text-sm text-slate-600">{STORE.contact.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Linha final */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} {STORE.name}. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <Link to="/privacidade" className="text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors">
              Privacidade
            </Link>
            <Link to="/termos" className="text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors">
              Termos de uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
