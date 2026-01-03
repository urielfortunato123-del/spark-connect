import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Building2,
  Radio,
  Zap,
  MapPin,
  TreePine,
  BarChart3,
  FileText,
  Bot,
  Settings,
  LogOut,
  ChevronRight,
  Crown,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type AppModule = 'torres_5g' | 'eletropostos' | 'viabilidade' | 'ambiental' | 'cenarios' | 'relatorios' | 'ia_assistant';

interface ModuleItem {
  title: string;
  url: string;
  icon: React.ElementType;
  module: AppModule | null;
  badge?: string;
}

const mainModules: ModuleItem[] = [
  { title: 'Torres 5G', url: '/torres-5g', icon: Radio, module: 'torres_5g' },
  { title: 'Eletropostos', url: '/eletropostos', icon: Zap, module: 'eletropostos' },
  { title: 'Viabilidade', url: '/viabilidade', icon: MapPin, module: 'viabilidade' },
  { title: 'Ambiental', url: '/ambiental', icon: TreePine, module: 'ambiental' },
  { title: 'Cenários', url: '/cenarios', icon: BarChart3, module: 'cenarios' },
  { title: 'Relatórios', url: '/relatorios', icon: FileText, module: 'relatorios' },
];

const toolModules: ModuleItem[] = [
  { title: 'Assistente IA', url: '/assistente', icon: Bot, module: 'ia_assistant', badge: 'IA' },
];

const planLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-muted text-muted-foreground' },
  telecom: { label: 'Telecom', color: 'bg-blue-500/20 text-blue-400' },
  ev: { label: 'EV', color: 'bg-green-500/20 text-green-400' },
  governo: { label: 'Governo', color: 'bg-yellow-500/20 text-yellow-400' },
  pro: { label: 'Pro', color: 'bg-primary/20 text-primary' },
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user, profile, userPlan, hasModuleAccess, signOut, isAdmin } = useAuth();

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

  const planInfo = planLabels[userPlan?.plan || 'free'];

  const renderMenuItem = (item: ModuleItem) => {
    const hasAccess = item.module === null || hasModuleAccess(item.module);
    const active = isActive(item.url);

    return (
      <SidebarMenuItem key={item.title}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton asChild disabled={!hasAccess}>
              {hasAccess ? (
                <NavLink 
                  to={item.url} 
                  end 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    active 
                      ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                  activeClassName=""
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30">
                          {item.badge}
                        </Badge>
                      )}
                      {active && <ChevronRight className="h-3 w-3" />}
                    </>
                  )}
                </NavLink>
              ) : (
                <div className={`flex items-center gap-3 px-3 py-2 rounded-lg opacity-50 cursor-not-allowed`}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      <Lock className="h-3 w-3" />
                    </>
                  )}
                </div>
              )}
            </SidebarMenuButton>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">
              {item.title}
              {!hasAccess && ' (Bloqueado)'}
            </TooltipContent>
          )}
        </Tooltip>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar 
      className={`border-r border-sidebar-border bg-sidebar ${collapsed ? 'w-14' : 'w-60'}`}
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-foreground text-sm truncate">InfraBrasil</h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">2026</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-2 py-4">
        {/* Dashboard Link */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink 
                  to="/" 
                  end 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    currentPath === '/' 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                  activeClassName=""
                >
                  <BarChart3 className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Main Modules */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-2">
              Módulos
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainModules.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-2">
              Ferramentas
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {toolModules.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {user ? (
          <div className="space-y-3">
            {/* Plan Badge */}
            {!collapsed && (
              <div className={`px-3 py-2 rounded-lg ${planInfo.color} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <Crown className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Plano {planInfo.label}</span>
                </div>
                {userPlan?.plan !== 'pro' && (
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                    Upgrade
                  </Button>
                )}
              </div>
            )}

            {/* User Info */}
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-foreground">
                  {(profile?.full_name || user.email || '?')[0].toUpperCase()}
                </span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile?.full_name || 'Usuário'}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className={`flex ${collapsed ? 'flex-col' : 'gap-2'}`}>
              {isAdmin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2" asChild>
                      <NavLink to="/admin" activeClassName="">
                        <Settings className="h-4 w-4" />
                        {!collapsed && <span>Admin</span>}
                      </NavLink>
                    </Button>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">Admin</TooltipContent>}
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 justify-start gap-2 text-destructive hover:text-destructive"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4" />
                    {!collapsed && <span>Sair</span>}
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Sair</TooltipContent>}
              </Tooltip>
            </div>
          </div>
        ) : (
          <Button variant="default" className="w-full" asChild>
            <NavLink to="/auth" activeClassName="">
              Entrar
            </NavLink>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
