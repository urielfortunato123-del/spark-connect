import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CategoryItem {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  desc?: string;
  description?: string;
  subtypes?: string[];
}

interface CategoryAccordionProps {
  categories: CategoryItem[];
  onSelect: (categoryId: string) => void;
  selectedCategory?: string | null;
  getSubtypes?: (categoryId: string) => string[];
}

export function CategoryAccordion({
  categories,
  onSelect,
  selectedCategory,
  getSubtypes,
}: CategoryAccordionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;
        const subtypes = cat.subtypes?.length ? cat.subtypes : getSubtypes?.(cat.id) ?? [];

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              'glass-card w-full rounded-3xl border border-border/60 p-6 text-center transition-all duration-200 hover:border-primary/40 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              isSelected && 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/5'
            )}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-2xl',
                  `${cat.color}/10`
                )}
              >
                <Icon className={cn('h-6 w-6', cat.color.replace('bg-', 'text-'))} />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">{cat.title}</h3>
                {(cat.desc || cat.description) && (
                  <p className="text-sm text-muted-foreground">{cat.desc || cat.description}</p>
                )}
              </div>

              {subtypes.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  {subtypes.slice(0, 3).map((subtype) => (
                    <Badge key={subtype} variant="secondary" className="max-w-full truncate text-[10px]">
                      {subtype}
                    </Badge>
                  ))}
                  {subtypes.length > 3 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{subtypes.length - 3} serviços
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface CategoryDropdownProps {
  categories: CategoryItem[];
  value: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function CategoryDropdown({
  categories,
  value,
  onValueChange,
  placeholder = 'Selecione uma categoria',
}: CategoryDropdownProps) {
  return (
    <Select value={value || ''} onValueChange={onValueChange}>
      <SelectTrigger className="w-full md:w-[300px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((cat) => {
          const Icon = cat.icon;

          return (
            <SelectItem key={cat.id} value={cat.id}>
              <div className="flex items-center gap-2">
                <Icon className={cn('h-4 w-4', cat.color.replace('bg-', 'text-'))} />
                <span>{cat.title}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
