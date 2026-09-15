import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { STORE } from '@/config/store';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { ProductFilters, FilterState } from '@/components/ProductFilters';
import { useProducts } from '@/hooks/useProducts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { spring, easing } from '@/lib/motion';
import {
  Search, SlidersHorizontal, Phone, Watch, Headphones,
  Shield, Zap, LayoutGrid, Bot, X, RefreshCcw, Tag, PackageSearch,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

// Busca insensível a acentos (pt-BR): "fone bluetooth" encontra "Fone via Bluetooth"
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// ─── Categorias conhecidas (ícone) ────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Todos',       value: '',            icon: LayoutGrid },
  { label: 'Smartphones', value: 'Smartphone',  icon: Phone },
  { label: 'Relógios',    value: 'Watch',       icon: Watch },
  { label: 'Áudio',       value: 'Audio',       icon: Headphones },
  { label: 'Proteção',    value: 'Protection',  icon: Shield },
  { label: 'Energia',     value: 'Power',       icon: Zap },
];

// ─── Página ───────────────────────────────────────────────────────────────────
const Products: React.FC = () => {
  const { usePageVisit } = useAnalytics();
  usePageVisit('products');

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';

  const { data: products = [], isLoading } = useProducts();

  const [filters, setFilters] = useState<FilterState>({
    search: initialQuery,
    category: initialCategory,
    priceRange: [0, 15000],
    sortBy: 'created_at_desc',
    inStockOnly: false,
    featuredOnly: false,
  });

  // Espelha busca/categoria na URL: voltar do produto, refresh ou compartilhar
  // o link preserva os filtros. replace evita poluir o histórico a cada tecla.
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('q', filters.search);
    if (filters.category) params.set('category', filters.category);
    setSearchParams(params, { replace: true });
  }, [filters.search, filters.category, setSearchParams]);

  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiMatchIds, setAiMatchIds] = useState<string[] | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const priceRangeSynced = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { priceRange } = useMemo(() => {
    if (!products.length) return { priceRange: [0, 15000] as [number, number] };
    const prices = products.map(p => Number(p.price));
    return { priceRange: [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))] as [number, number] };
  }, [products]);

  const dynamicCategories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return cats;
  }, [products]);

  useEffect(() => {
    if (!priceRangeSynced.current && products.length > 0) {
      priceRangeSynced.current = true;
      setFilters(prev => ({ ...prev, priceRange }));
    }
  }, [products.length, priceRange]);

  const handleSemanticSearch = useCallback(async () => {
    setIsAiSearching(true);
    try {
      const productContext = products.map(p => ({ id: p.id, name: p.name, category: p.category, description: p.description }));
      const sanitized = filters.search.replace(/["\\]/g, '').slice(0, 100);
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: `Busca Semântica: "${sanitized}". Retorne APENAS um array JSON de IDs (máx. 8) dos produtos mais relevantes. Lista: ${JSON.stringify(productContext.slice(0, 40))}. Apenas o array.`,
          context: 'Lumina Semantic Engine',
        },
      });
      if (error) throw error;
      const match = data.reply.match(/\[.*\]/s)?.[0];
      if (match) setAiMatchIds(JSON.parse(match));
    } catch {
      /* silent */
    } finally {
      setIsAiSearching(false);
    }
  }, [products, filters.search]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!filters.search || filters.search.length < 3) { setAiMatchIds(null); return; }
    searchTimeoutRef.current = setTimeout(handleSemanticSearch, 1500);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [filters.search, handleSemanticSearch]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (filters.search) {
      const q = norm(filters.search);
      list = list.filter(p =>
        norm(p.name).includes(q) ||
        (p.description && norm(p.description).includes(q)) ||
        aiMatchIds?.includes(p.id)
      );
    }
    if (filters.category) list = list.filter(p => p.category === filters.category);
    list = list.filter(p => Number(p.price) >= filters.priceRange[0] && Number(p.price) <= filters.priceRange[1]);
    if (filters.inStockOnly) list = list.filter(p => p.stock && p.stock > 0);
    if (filters.featuredOnly) list = list.filter(p => p.is_featured);
    switch (filters.sortBy) {
      case 'price_asc':  list.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case 'price_desc': list.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case 'name_asc':   list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default:           list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [products, filters, aiMatchIds]);

  // Pills geradas dos dados: categorias novas aparecem automaticamente e
  // pills de categorias sem produto somem (os ícones das conhecidas ficam).
  const pillCategories = useMemo(() => {
    const known = new Set(CATEGORIES.map(c => c.value));
    const base = CATEGORIES.filter(c => c.value === '' || dynamicCategories.includes(c.value));
    const extras = dynamicCategories
      .filter(c => !known.has(c))
      .map(label => ({ label, value: label, icon: Tag }));
    return [...base, ...extras];
  }, [dynamicCategories]);

  // Contagem por categoria, para o balão mostrar quantos produtos há em cada
  const countByCategory = useMemo(() => {
    const map: Record<string, number> = { '': products.length };
    for (const p of products) if (p.category) map[p.category] = (map[p.category] ?? 0) + 1;
    return map;
  }, [products]);

  // Paginação client-side: renderiza 24 por vez (catálogos grandes não travam o grid)
  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filters, aiMatchIds]);

  const activeFilterCount = [filters.inStockOnly, filters.featuredOnly, !!filters.category].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEO title="Produtos" description="Acessórios e produtos variados com ótimos preços. Compre com PIX ou cartão e receba rapidamente." />
      <Header />

      {/* ── Abertura ── */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-5">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easing.smooth }}
          className="block text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600"
        >
          {STORE.name}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: easing.smooth }}
          className="mt-2 text-[44px] sm:text-[56px] leading-[0.9] font-bold tracking-[-0.045em] text-slate-900"
        >
          TODOS OS
          <span className="block text-blue-600">PRODUTOS.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-3 max-w-md text-sm text-slate-500 leading-relaxed"
        >
          Acessórios e produtos variados com ótimos preços — entrega rápida para todo o Brasil.
        </motion.p>
      </header>

      {/* ── Barra fixa: busca + filtros + balões ── */}
      <div className="sticky top-[60px] md:top-[64px] z-30 bg-white/90 backdrop-blur-xl border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${
                isAiSearching ? 'text-blue-600' : 'text-slate-400'
              }`}
            />
            <input
              ref={searchRef}
              type="search"
              placeholder="Buscar produto..."
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              aria-label="Buscar produtos"
              className="w-full h-11 pl-10 pr-10 rounded-full bg-slate-100 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition [&::-webkit-search-cancel-button]:hidden"
            />
            {filters.search && !isAiSearching && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                aria-label="Limpar busca"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isAiSearching && (
              <RefreshCcw className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 animate-spin" />
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label={activeFilterCount > 0 ? `Filtros, ${activeFilterCount} ativos` : 'Filtros'}
                className={`relative shrink-0 flex items-center gap-2 h-11 px-4 rounded-full border text-sm font-semibold transition-all active:scale-95 ${
                  activeFilterCount > 0
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-white border-t border-slate-200 rounded-t-3xl max-h-[90vh] overflow-y-auto pb-safe">
              <SheetHeader className="pb-4">
                <SheetTitle className="text-left text-lg font-bold text-slate-900">Filtros</SheetTitle>
              </SheetHeader>
              <ProductFilters filters={filters} onFiltersChange={setFilters} categories={dynamicCategories} priceRange={priceRange} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Balões de categoria */}
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2 px-4 sm:px-6 pb-3 w-max min-w-full">
            {pillCategories.map(({ label, value, icon: Icon }) => {
              const active = filters.category === value;
              const count = countByCategory[value] ?? 0;
              return (
                <motion.button
                  key={value}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  transition={spring.snappy}
                  aria-pressed={active}
                  onClick={() => setFilters(prev => ({ ...prev, category: prev.category === value ? '' : value }))}
                  className={`shrink-0 h-11 pl-3.5 pr-2 rounded-full text-[13px] font-semibold flex items-center gap-2 border transition-all ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25'
                      : 'bg-white text-slate-600 border-slate-200 shadow-sm hover:border-slate-400'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  <span className="whitespace-nowrap">{label}</span>
                  <span
                    className={`min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <main id="conteudo" tabIndex={-1} className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-36">
        {!isLoading && (
          <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{filteredProducts.length}</span>{' '}
              {filteredProducts.length === 1 ? 'produto' : 'produtos'}
              {filters.category && <span> em <span className="font-semibold text-slate-700">{filters.category}</span></span>}
              {aiMatchIds && filters.search && <span className="text-blue-600"> · busca inteligente</span>}
            </p>

            <label className="flex items-center gap-2 text-sm text-slate-500">
              <span className="hidden sm:inline">Ordenar</span>
              <select
                value={filters.sortBy}
                onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
                aria-label="Ordenar produtos"
                className="h-10 pl-3 pr-8 rounded-full bg-white border border-slate-200 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
              >
                <option value="created_at_desc">Mais recentes</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="name_asc">A–Z</option>
              </select>
            </label>
          </div>
        )}

        {/* Faixa da busca ativa */}
        {filters.search && (
          <div className="flex items-center gap-3 mb-4 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
            {isAiSearching
              ? <RefreshCcw className="w-4 h-4 text-blue-600 animate-spin shrink-0" aria-hidden="true" />
              : <Bot className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />}
            <p className="text-sm text-slate-700 flex-1">
              {isAiSearching
                ? 'Buscando…'
                : aiMatchIds
                  ? <>Resultados para <span className="font-semibold">"{filters.search}"</span></>
                  : <>Buscando por <span className="font-semibold">"{filters.search}"</span></>}
            </p>
            <button
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              aria-label="Limpar busca"
              className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4" aria-busy="true">
            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.slice(0, visibleCount).map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                className={
                  // O primeiro destaque, sem filtro, vira o card largo (2 colunas)
                  index === 0 && !filters.search && !filters.category && product.is_featured
                    ? 'col-span-2 md:col-span-2'
                    : ''
                }
              />
            ))}
          </div>
        ) : null}

        {!isLoading && filteredProducts.length > visibleCount && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
              className="h-11 px-6 rounded-full bg-white border border-slate-200 text-slate-800 font-semibold text-sm hover:border-blue-300 hover:bg-blue-50"
            >
              Carregar mais ({filteredProducts.length - visibleCount} restantes)
            </Button>
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 px-6 flex flex-col items-center text-center gap-2">
            <PackageSearch className="h-8 w-8 text-slate-300" aria-hidden="true" />
            <h3 className="text-base font-bold text-slate-900">Nenhum produto encontrado</h3>
            <p className="text-sm text-slate-500 max-w-xs">Tente mudar os filtros ou buscar por algo diferente.</p>
            <Button
              onClick={() => setFilters(prev => ({ ...prev, search: '', category: '', inStockOnly: false, featuredOnly: false }))}
              className="mt-3 h-11 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
            >
              <X className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Limpar filtros
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;
