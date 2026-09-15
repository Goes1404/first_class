import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Filter } from 'lucide-react';

export interface FilterState {
  search: string;
  category: string;
  priceRange: [number, number];
  sortBy: string;
  inStockOnly: boolean;
  featuredOnly: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: string[];
  priceRange: [number, number];
  isMobile?: boolean;
}

const sectionTitle = 'text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2';
const categoryBtn = (active: boolean) =>
  `text-left h-11 px-4 rounded-xl text-sm font-medium transition-colors ${
    active ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-700 hover:bg-slate-100 border border-transparent'
  }`;
const inputCls =
  'h-11 rounded-xl bg-slate-100 border-slate-200 text-slate-900 focus-visible:ring-blue-100 focus-visible:border-blue-500';

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  priceRange,
  isMobile = false,
}) => {
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category: '',
      priceRange: priceRange,
      sortBy: 'created_at_desc',
      inStockOnly: false,
      featuredOnly: false,
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.inStockOnly ||
    filters.featuredOnly || filters.priceRange[0] > priceRange[0] ||
    filters.priceRange[1] < priceRange[1];

  return (
    <div className={`space-y-7 ${isMobile ? 'pb-20' : ''}`}>
      {/* Categorias */}
      <div className="space-y-3">
        <h3 className={sectionTitle}>
          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
          Categorias
        </h3>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => handleFilterChange('category', '')}
            aria-pressed={filters.category === ''}
            className={categoryBtn(filters.category === '')}
          >
            Todas as categorias
          </button>
          {categories.filter(category => category && category.trim() !== '').map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleFilterChange('category', category)}
              aria-pressed={filters.category === category}
              className={categoryBtn(filters.category === category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Faixa de preço */}
      <div className="space-y-3 pt-5 border-t border-slate-200">
        <h3 className={sectionTitle}>Faixa de preço</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500">Mínimo</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={filters.priceRange[0]}
              onChange={(e) => handleFilterChange('priceRange', [parseFloat(e.target.value) || 0, filters.priceRange[1]])}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500">Máximo</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={filters.priceRange[1]}
              onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseFloat(e.target.value) || 0])}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Disponibilidade */}
      <div className="space-y-3 pt-5 border-t border-slate-200">
        <h3 className={sectionTitle}>Mostrar só</h3>
        <div className="space-y-1">
          <label className="flex items-center gap-3 h-11 px-1 cursor-pointer rounded-xl hover:bg-slate-50">
            <Checkbox
              checked={filters.inStockOnly}
              onCheckedChange={(checked) => handleFilterChange('inStockOnly', !!checked)}
              className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <span className="text-sm text-slate-700">Em estoque</span>
          </label>
          <label className="flex items-center gap-3 h-11 px-1 cursor-pointer rounded-xl hover:bg-slate-50">
            <Checkbox
              checked={filters.featuredOnly}
              onCheckedChange={(checked) => handleFilterChange('featuredOnly', !!checked)}
              className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <span className="text-sm text-slate-700">Mais vendidos</span>
          </label>
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full h-12 rounded-full border-slate-200 text-slate-800 hover:bg-slate-100 font-semibold"
        >
          <X className="mr-2 h-4 w-4" aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
};
