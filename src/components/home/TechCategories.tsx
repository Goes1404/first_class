import React from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone, Headphones, House, Gamepad2, Laptop, Watch,
  Shield, BatteryCharging, Cable, LayoutGrid, type LucideIcon,
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { groupForCategory } from '@/lib/catalogGroups';

/** Palavras-chave → ícone. Casamos pelo nome real da categoria no banco,
 *  sem acento e em minúsculas, então "Áudio" e "audio" caem no mesmo ícone. */
const ICON_RULES: Array<{ match: RegExp; icon: LucideIcon }> = [
  { match: /phone|celular|smartphone|iphone/, icon: Smartphone },
  { match: /audio|fone|headset|som|caixa/, icon: Headphones },
  { match: /casa|home|smart/, icon: House },
  { match: /game|gamer|console/, icon: Gamepad2 },
  { match: /note|laptop|computad|pc/, icon: Laptop },
  { match: /watch|relogio|rel[oó]gio/, icon: Watch },
  { match: /case|capa|protec|pelicula|pel[ií]cula/, icon: Shield },
  { match: /power|bateria|carreg|energia/, icon: BatteryCharging },
  { match: /cabo|adaptad|hub/, icon: Cable },
];

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const iconFor = (category: string): LucideIcon => {
  const n = normalize(category);
  return ICON_RULES.find((r) => r.match.test(n))?.icon ?? LayoutGrid;
};

const SKELETON_COUNT = 6;

export const TechCategories: React.FC = () => {
  const { data: products, isLoading } = useProducts();

  // Categorias reais do catálogo, ordenadas pelas que têm mais produtos.
  const categories = React.useMemo(() => {
    if (!products?.length) return [];
    const counts = new Map<string, number>();
    for (const p of products) {
      if (!p.category) continue;
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
  }, [products]);

  if (isLoading) {
    return (
      <section className="pt-6" aria-label="Categorias" aria-busy="true">
        <div className="mx-auto max-w-5xl px-4 flex gap-5 overflow-hidden">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <div className="h-14 w-14 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-2.5 w-12 rounded bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  const items = [
    ...categories.map((name) => ({
      label: name,
      // Categoria com aba dedicada vai para ela em vez da listagem genérica.
      to: groupForCategory(name)?.slug
        ? `/${groupForCategory(name)!.slug}`
        : `/produtos?category=${encodeURIComponent(name)}`,
      Icon: iconFor(name),
    })),
    { label: 'Ver tudo', to: '/produtos', Icon: LayoutGrid },
  ];

  return (
    <section className="pt-6" aria-label="Categorias">
      <div className="mx-auto max-w-5xl px-4">
        <ul className="flex gap-5 sm:gap-8 overflow-x-auto pb-1 sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map(({ label, to, Icon }) => (
            <li key={label} className="shrink-0">
              <Link to={to} className="flex flex-col items-center gap-2 w-[68px] group">
                <span className="h-14 w-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 group-hover:border-blue-500 group-hover:text-blue-600 group-hover:shadow-md transition-all">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-[11px] font-medium text-slate-600 text-center leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
