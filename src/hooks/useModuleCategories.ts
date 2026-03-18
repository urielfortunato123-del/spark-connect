/**
 * Hook para carregar categorias/subtipos de um módulo.
 * Tenta buscar do backend (module_categories); se vazio ou erro, usa fallback local do moduleRegistry.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  type ModuleId,
  type CategoryDef,
  getModuleCategories,
  getSubtypes as getLocalSubtypes,
} from '@/data/moduleRegistry';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DbCategory {
  id: string;
  module_id: string;
  category_id: string;
  title: string;
  icon_name: string;
  color: string;
  description: string | null;
  subtypes: string[];
  sort_order: number;
  is_active: boolean;
}

/** Resolve icon name string to a Lucide component */
function resolveIcon(name: string): LucideIcon {
  const icon = (Icons as Record<string, unknown>)[name];
  return (typeof icon === 'function' ? icon : Icons.FileText) as LucideIcon;
}

function mapDbToCategory(row: DbCategory): CategoryDef {
  return {
    id: row.category_id,
    title: row.title,
    icon: resolveIcon(row.icon_name),
    color: row.color,
    desc: row.description ?? '',
    subtypes: row.subtypes ?? [],
  };
}

export function useModuleCategories(moduleId: ModuleId) {
  const localCategories = getModuleCategories(moduleId);

  const { data: dbCategories, isLoading, isError } = useQuery({
    queryKey: ['module-categories', moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_categories' as any)
        .select('*')
        .eq('module_id', moduleId)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return (data as unknown as DbCategory[]) ?? [];
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
    retry: 1,
  });

  // Use DB data if available, otherwise fallback to local registry
  const categories: CategoryDef[] =
    !isLoading && !isError && dbCategories && dbCategories.length > 0
      ? dbCategories.map(mapDbToCategory)
      : localCategories;

  const source: 'backend' | 'local' =
    !isLoading && !isError && dbCategories && dbCategories.length > 0
      ? 'backend'
      : 'local';

  const getCategoryInfo = (categoryId: string | null): CategoryDef | undefined =>
    categoryId ? categories.find((c) => c.id === categoryId) : undefined;

  const getCategorySubtypes = (categoryId: string | null): string[] => {
    if (!categoryId) return [];
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.subtypes ?? getLocalSubtypes(moduleId, categoryId);
  };

  return {
    categories,
    isLoading,
    source,
    getCategoryInfo,
    getCategorySubtypes,
  };
}
