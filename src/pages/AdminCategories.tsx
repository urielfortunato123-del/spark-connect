import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, RefreshCw, Layers, ArrowLeft, Upload, Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MODULE_REGISTRY, type ModuleId } from '@/data/moduleRegistry';

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
  created_at: string;
  updated_at: string;
}

const MODULE_OPTIONS = Object.entries(MODULE_REGISTRY).map(([id, def]) => ({
  id: id as ModuleId,
  label: def.label,
}));

const emptyForm = {
  module_id: '' as string,
  category_id: '',
  title: '',
  icon_name: 'FileText',
  color: 'bg-gray-500',
  description: '',
  subtypes: '',
  sort_order: 0,
  is_active: true,
};

export default function AdminCategories() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterModule, setFilterModule] = useState<string>('all');
  const [editDialog, setEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Fetch all categories
  const { data: categories = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-module-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_categories' as any)
        .select('*')
        .order('module_id')
        .order('sort_order');
      if (error) throw error;
      return (data as unknown as DbCategory[]) ?? [];
    },
  });

  const filtered = useMemo(() => {
    if (filterModule === 'all') return categories;
    return categories.filter((c) => c.module_id === filterModule);
  }, [categories, filterModule]);

  // Upsert mutation
  const upsertMutation = useMutation({
    mutationFn: async (payload: Omit<DbCategory, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
      const subtypesArray = typeof payload.subtypes === 'string'
        ? (payload.subtypes as string).split('\n').map((s: string) => s.trim()).filter(Boolean)
        : payload.subtypes;

      const row = { ...payload, subtypes: subtypesArray };

      if (payload.id) {
        const { error } = await supabase
          .from('module_categories' as any)
          .update(row as any)
          .eq('id', payload.id);
        if (error) throw error;
      } else {
        const { id: _, ...insertRow } = row;
        const { error } = await supabase
          .from('module_categories' as any)
          .insert(insertRow as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-module-categories'] });
      queryClient.invalidateQueries({ queryKey: ['module-categories'] });
      toast.success(editingId ? 'Categoria atualizada' : 'Categoria criada');
      closeDialog();
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('module_categories' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-module-categories'] });
      queryClient.invalidateQueries({ queryKey: ['module-categories'] });
      toast.success('Categoria removida');
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Seed from local registry
  const seedMutation = useMutation({
    mutationFn: async (moduleId: ModuleId) => {
      const mod = MODULE_REGISTRY[moduleId];
      if (!mod) throw new Error('Módulo não encontrado');

      const rows = mod.categories.map((cat, i) => ({
        module_id: moduleId,
        category_id: cat.id,
        title: cat.title,
        icon_name: cat.icon.displayName || cat.icon.name || 'FileText',
        color: cat.color,
        description: cat.desc,
        subtypes: cat.subtypes,
        sort_order: i,
        is_active: true,
      }));

      const { error } = await supabase
        .from('module_categories' as any)
        .upsert(rows as any, { onConflict: 'module_id,category_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-module-categories'] });
      queryClient.invalidateQueries({ queryKey: ['module-categories'] });
      toast.success('Categorias importadas do registro local');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, module_id: filterModule !== 'all' ? filterModule : '' });
    setEditDialog(true);
  };

  const openEdit = (cat: DbCategory) => {
    setEditingId(cat.id);
    setForm({
      module_id: cat.module_id,
      category_id: cat.category_id,
      title: cat.title,
      icon_name: cat.icon_name,
      color: cat.color,
      description: cat.description || '',
      subtypes: cat.subtypes.join('\n'),
      sort_order: cat.sort_order,
      is_active: cat.is_active,
    });
    setEditDialog(true);
  };

  const closeDialog = () => {
    setEditDialog(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = () => {
    if (!form.module_id || !form.category_id || !form.title) {
      toast.error('Preencha módulo, ID e título');
      return;
    }
    upsertMutation.mutate({
      ...(editingId ? { id: editingId } : {}),
      module_id: form.module_id,
      category_id: form.category_id,
      title: form.title,
      icon_name: form.icon_name,
      color: form.color,
      description: form.description || null,
      subtypes: form.subtypes as any,
      sort_order: form.sort_order,
      is_active: form.is_active,
    } as any);
  };

  const getModuleLabel = (id: string) =>
    MODULE_OPTIONS.find((m) => m.id === id)?.label || id;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                <Layers className="h-6 w-6 text-primary" />
                Categorias & Subtipos
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerencie as categorias e serviços de cada módulo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Nova Categoria
            </Button>
          </div>
        </div>

        {/* Filter + Seed */}
        <Card className="glass-card">
          <CardContent className="py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex-1 max-w-xs">
                <Label className="text-xs">Filtrar por módulo</Label>
                <Select value={filterModule} onValueChange={setFilterModule}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os módulos</SelectItem>
                    {MODULE_OPTIONS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filterModule !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => seedMutation.mutate(filterModule as ModuleId)}
                  disabled={seedMutation.isPending}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {seedMutation.isPending ? 'Importando...' : 'Importar do Registro Local'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="glass-card">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-foreground">{categories.length}</p>
              <p className="text-xs text-muted-foreground">Total Categorias</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {new Set(categories.map((c) => c.module_id)).size}
              </p>
              <p className="text-xs text-muted-foreground">Módulos com Dados</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {categories.reduce((sum, c) => sum + c.subtypes.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Subtipos</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {categories.filter((c) => c.is_active).length}
              </p>
              <p className="text-xs text-muted-foreground">Ativas</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">
              {filterModule !== 'all' ? getModuleLabel(filterModule) : 'Todas as Categorias'}
              <Badge variant="secondary" className="ml-2">{filtered.length}</Badge>
            </CardTitle>
            <CardDescription>
              {categories.length === 0
                ? 'Nenhuma categoria no backend. Use "Importar do Registro Local" para popular.'
                : 'Clique em editar para modificar ou adicione novas categorias.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Carregando...</p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Selecione um módulo e clique em "Importar do Registro Local" para começar
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">#</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Ícone</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead>Subtipos</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="text-muted-foreground">{cat.sort_order}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {getModuleLabel(cat.module_id)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{cat.title}</p>
                            <p className="text-xs text-muted-foreground">{cat.category_id}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{cat.icon_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${cat.color}`} />
                            <span className="text-xs text-muted-foreground">{cat.color}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{cat.subtypes.length} serviços</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={cat.is_active ? 'default' : 'destructive'} className="text-[10px]">
                            {cat.is_active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm(`Remover "${cat.title}"?`)) {
                                  deleteMutation.mutate(cat.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit / Create Dialog */}
        <Dialog open={editDialog} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Módulo *</Label>
                  <Select value={form.module_id} onValueChange={(v) => setForm({ ...form, module_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {MODULE_OPTIONS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ID da Categoria *</Label>
                  <Input
                    placeholder="ex: solar"
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    disabled={!!editingId}
                  />
                </div>
              </div>

              <div>
                <Label>Título *</Label>
                <Input
                  placeholder="ex: Geração Solar"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Ícone (Lucide)</Label>
                  <Input
                    placeholder="ex: Sun, Mountain"
                    value={form.icon_name}
                    onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Cor (Tailwind class)</Label>
                  <Input
                    placeholder="ex: bg-amber-500"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Input
                  placeholder="Breve descrição da categoria"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <Label>Subtipos (um por linha)</Label>
                <Textarea
                  placeholder={'Mina a Céu Aberto\nMina Subterrânea\nLavra de Aluvião'}
                  value={form.subtypes}
                  onChange={(e) => setForm({ ...form, subtypes: e.target.value })}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {form.subtypes.split('\n').filter(Boolean).length} subtipos
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                  />
                  <Label>Ativa</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button onClick={handleSave} disabled={upsertMutation.isPending}>
                {upsertMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
