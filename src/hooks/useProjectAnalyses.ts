import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SaveAnalysisParams {
  module: string;
  category?: string;
  projectName: string;
  projectData: Record<string, any>;
  analysisContent: string;
}

interface ProjectAnalysis {
  id: string;
  user_id: string;
  module: string;
  category: string | null;
  project_name: string;
  project_data: Record<string, any>;
  analysis_content: string;
  created_at: string;
}

export function useProjectAnalyses(module?: string) {
  const queryClient = useQueryClient();

  const { data: analyses, isLoading } = useQuery({
    queryKey: ['project-analyses', module],
    queryFn: async () => {
      let query = supabase
        .from('project_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (module) {
        query = query.eq('module', module);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProjectAnalysis[];
    },
  });

  const saveAnalysis = useMutation({
    mutationFn: async (params: SaveAnalysisParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase.from('project_analyses').insert({
        user_id: user.id,
        module: params.module,
        category: params.category || null,
        project_name: params.projectName,
        project_data: params.projectData,
        analysis_content: params.analysisContent,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-analyses'] });
      toast.success('Análise salva com sucesso!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao salvar análise');
    },
  });

  const deleteAnalysis = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('project_analyses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-analyses'] });
      toast.success('Análise removida');
    },
    onError: () => {
      toast.error('Erro ao remover análise');
    },
  });

  return {
    analyses: analyses || [],
    isLoading,
    saveAnalysis,
    deleteAnalysis,
  };
}
