/**
 * ProjectSelector — componente reutilizável para seleção de Categoria + Subtipo.
 *
 * - Recebe o moduleId, busca categorias/subtipos do registry central.
 * - Subtipo desabilitado até selecionar categoria.
 * - Ao trocar categoria, subtipo é resetado.
 * - Compatível com dark-theme e inputs estilizados do projeto.
 */

import { useCallback, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  type ModuleId,
  type CategoryDef,
  getModuleCategories,
  getSubtypes,
} from '@/data/moduleRegistry';

// ─── Grid de categorias (aba Categorias) ────────────────────────

interface CategoryGridProps {
  moduleId: ModuleId;
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryGrid({ moduleId, selectedCategory, onSelectCategory }: CategoryGridProps) {
  const categories = useMemo(() => getModuleCategories(moduleId), [moduleId]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              'glass-card w-full rounded-3xl border border-border/60 p-6 text-center transition-all duration-200',
              'hover:border-primary/40 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              isSelected && 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/5'
            )}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', `${cat.color}/10`)}>
                <Icon className={cn('h-6 w-6', cat.color.replace('bg-', 'text-'))} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">{cat.title}</h3>
                <p className="text-sm text-muted-foreground">{cat.desc}</p>
              </div>
              {cat.subtypes.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  {cat.subtypes.slice(0, 3).map((s) => (
                    <Badge key={s} variant="secondary" className="max-w-full truncate text-[10px]">{s}</Badge>
                  ))}
                  {cat.subtypes.length > 3 && (
                    <Badge variant="outline" className="text-[10px]">+{cat.subtypes.length - 3} serviços</Badge>
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

// ─── Dropdown de categoria (header da aba Projeto) ──────────────

interface CategoryDropdownProps {
  moduleId: ModuleId;
  value: string | null;
  onValueChange: (categoryId: string) => void;
  placeholder?: string;
}

export function CategoryDropdown({ moduleId, value, onValueChange, placeholder = 'Selecione uma categoria' }: CategoryDropdownProps) {
  const categories = useMemo(() => getModuleCategories(moduleId), [moduleId]);

  return (
    <Select value={value ?? undefined} onValueChange={onValueChange}>
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

// ─── Seletor de Subtipo (dentro do formulário de projeto) ───────

interface SubtypeSelectorProps {
  moduleId: ModuleId;
  categoryId: string | null;
  value: string;
  onValueChange: (subtypeValue: string) => void;
  label?: string;
}

export function SubtypeSelector({ moduleId, categoryId, value, onValueChange, label = 'Subtipo *' }: SubtypeSelectorProps) {
  const subtypes = useMemo(
    () => (categoryId ? getSubtypes(moduleId, categoryId) : []),
    [moduleId, categoryId]
  );

  const isDisabled = !categoryId || subtypes.length === 0;
  const selectPlaceholder = !categoryId
    ? 'Selecione a categoria primeiro'
    : subtypes.length === 0
      ? 'Nenhum subtipo disponível'
      : 'Selecione';

  return (
    <div>
      <Label>{label}</Label>
      <Select
        key={`${moduleId}-${categoryId ?? 'sem-categoria'}`}
        value={value || undefined}
        onValueChange={onValueChange}
        disabled={isDisabled}
      >
        <SelectTrigger className={cn(isDisabled && 'opacity-50')}>
          <SelectValue placeholder={selectPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {subtypes.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Hook para gerenciar estado de categoria + subtipo ──────────

export function useProjectSelector(moduleId: ModuleId) {
  const categories = useMemo(() => getModuleCategories(moduleId), [moduleId]);

  const getCategoryInfo = useCallback(
    (categoryId: string | null): CategoryDef | undefined =>
      categoryId ? categories.find((c) => c.id === categoryId) : undefined,
    [categories]
  );

  const getCategorySubtypes = useCallback(
    (categoryId: string | null): string[] =>
      categoryId ? getSubtypes(moduleId, categoryId) : [],
    [moduleId]
  );

  return { categories, getCategoryInfo, getCategorySubtypes };
}
