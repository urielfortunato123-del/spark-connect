import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Users, Crown, Shield, Settings2, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';

type AppPlan = 'free' | 'telecom' | 'ev' | 'governo' | 'pro';
type AppModule = 'torres_5g' | 'eletropostos' | 'viabilidade' | 'ambiental' | 'cenarios' | 'relatorios' | 'ia_assistant';
type AppRole = 'admin' | 'user';

interface UserData {
  id: string;
  user_id: string;
  full_name: string | null;
  company: string | null;
  email: string;
  plan: AppPlan;
  modules_enabled: AppModule[];
  role: AppRole;
  created_at: string;
}

const planLabels: Record<AppPlan, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-muted text-muted-foreground' },
  telecom: { label: 'Telecom', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  ev: { label: 'EV', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  governo: { label: 'Governo', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  pro: { label: 'Pro', color: 'bg-primary/20 text-primary border-primary/30' },
};

const moduleLabels: Record<AppModule, string> = {
  torres_5g: 'Torres 5G',
  eletropostos: 'Eletropostos',
  viabilidade: 'Viabilidade',
  ambiental: 'Ambiental',
  cenarios: 'Cenários',
  relatorios: 'Relatórios',
  ia_assistant: 'Assistente IA',
};

const allModules: AppModule[] = ['torres_5g', 'eletropostos', 'viabilidade', 'ambiental', 'cenarios', 'relatorios', 'ia_assistant'];

export default function Admin() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<AppPlan>('free');
  const [selectedModules, setSelectedModules] = useState<AppModule[]>([]);
  const [selectedRole, setSelectedRole] = useState<AppRole>('user');

  // Fetch all users with their profiles, plans, and roles
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch plans
      const { data: plans, error: plansError } = await supabase
        .from('user_plans')
        .select('*');

      if (plansError) throw plansError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine data
      const usersData: UserData[] = profiles.map(profile => {
        const plan = plans.find(p => p.user_id === profile.user_id);
        const role = roles.find(r => r.user_id === profile.user_id);

        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          company: profile.company,
          email: profile.user_id, // Will be replaced with actual email if available
          plan: (plan?.plan as AppPlan) || 'free',
          modules_enabled: (plan?.modules_enabled as AppModule[]) || [],
          role: (role?.role as AppRole) || 'user',
          created_at: profile.created_at,
        };
      });

      return usersData;
    },
  });

  // Update user plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ userId, plan, modules }: { userId: string; plan: AppPlan; modules: AppModule[] }) => {
      const { error } = await supabase
        .from('user_plans')
        .update({ plan, modules_enabled: modules })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Plano atualizado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar plano: ' + error.message);
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Papel atualizado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar papel: ' + error.message);
    },
  });

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setSelectedPlan(user.plan);
    setSelectedModules(user.modules_enabled);
    setSelectedRole(user.role);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    await updatePlanMutation.mutateAsync({
      userId: editingUser.user_id,
      plan: selectedPlan,
      modules: selectedPlan === 'pro' ? allModules : selectedModules,
    });

    if (selectedRole !== editingUser.role) {
      await updateRoleMutation.mutateAsync({
        userId: editingUser.user_id,
        role: selectedRole,
      });
    }

    setEditingUser(null);
  };

  const toggleModule = (module: AppModule) => {
    setSelectedModules(prev => 
      prev.includes(module) 
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    total: users?.length || 0,
    admins: users?.filter(u => u.role === 'admin').length || 0,
    pro: users?.filter(u => u.plan === 'pro').length || 0,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie usuários, planos e permissões</p>
          </div>
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.admins}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Plano Pro</CardTitle>
              <Crown className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.pro}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Usuários</CardTitle>
                <CardDescription>Lista de todos os usuários cadastrados</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Módulos</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {(user.full_name || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.full_name || 'Sem nome'}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {user.user_id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.company || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={planLabels[user.plan].color} variant="outline">
                          {planLabels[user.plan].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap max-w-[200px]">
                          {user.plan === 'pro' ? (
                            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                              Todos
                            </Badge>
                          ) : user.modules_enabled.length > 0 ? (
                            user.modules_enabled.slice(0, 2).map(module => (
                              <Badge key={module} variant="outline" className="text-[10px]">
                                {moduleLabels[module]}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Nenhum</span>
                          )}
                          {user.modules_enabled.length > 2 && user.plan !== 'pro' && (
                            <Badge variant="outline" className="text-[10px]">
                              +{user.modules_enabled.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.role === 'admin' ? (
                          <Badge className="bg-destructive/20 text-destructive border-destructive/30" variant="outline">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Usuário
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                {editingUser?.full_name || 'Usuário'} - {editingUser?.user_id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Plan Selection */}
              <div className="space-y-2">
                <Label>Plano</Label>
                <Select value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as AppPlan)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="telecom">Telecom</SelectItem>
                    <SelectItem value="ev">EV</SelectItem>
                    <SelectItem value="governo">Governo</SelectItem>
                    <SelectItem value="pro">Pro (Todos os módulos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Modules Selection (disabled for Pro) */}
              <div className="space-y-2">
                <Label>Módulos Habilitados</Label>
                {selectedPlan === 'pro' ? (
                  <p className="text-sm text-muted-foreground">
                    O plano Pro inclui todos os módulos automaticamente.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {allModules.map((module) => (
                      <div key={module} className="flex items-center space-x-2">
                        <Checkbox
                          id={module}
                          checked={selectedModules.includes(module)}
                          onCheckedChange={() => toggleModule(module)}
                        />
                        <label
                          htmlFor={module}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {moduleLabels[module]}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>Papel</Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                {selectedRole === 'admin' && (
                  <p className="text-xs text-destructive">
                    ⚠️ Administradores têm acesso total ao painel de gerenciamento.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveUser}
                disabled={updatePlanMutation.isPending || updateRoleMutation.isPending}
              >
                {(updatePlanMutation.isPending || updateRoleMutation.isPending) ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
