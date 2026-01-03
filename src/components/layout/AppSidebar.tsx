import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Radio,
  Zap,
  MapPin,
  TreePine,
  BarChart3,
  FileText,
  Bot,
  Settings,
  LogOut,
  Building2,
  Fuel,
  Mountain,
  Lightbulb,
  Droplets,
  Construction,
  Building,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type AppModule = 'torres_5g' | 'eletropostos' | 'viabilidade' | 'ambiental' | 'cenarios' | 'relatorios' | 'ia_assistant';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  module: AppModule | null;
  inDevelopment?: boolean;
}

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, module: null },
  { title: 'Torres 5G', url: '/torres-5g', icon: Radio, module: 'torres_5g' },
  { title: 'Eletropostos', url: '/eletropostos', icon: Zap, module: 'eletropostos' },
  { title: 'Viabilidade', url: '/viabilidade', icon: MapPin, module: 'viabilidade' },
  { title: 'Ambiental', url: '/ambiental', icon: TreePine, module: 'ambiental' },
  { title: 'Cenários', url: '/cenarios', icon: BarChart3, module: 'cenarios' },
  { title: 'Relatórios', url: '/relatorios', icon: FileText, module: 'relatorios' },
  { title: 'Assistente IA', url: '/assistente', icon: Bot, module: 'ia_assistant' },
];

const devNavItems: NavItem[] = [
  { title: 'Petróleo & Gás', url: '/petroleo', icon: Fuel, module: null, inDevelopment: true },
  { title: 'Energia Elétrica', url: '/energia', icon: Lightbulb, module: null, inDevelopment: true },
  { title: 'Mineração', url: '/mineracao', icon: Mountain, module: null, inDevelopment: true },
  { title: 'Saneamento', url: '/saneamento', icon: Droplets, module: null, inDevelopment: true },
  { title: 'Infraestrutura', url: '/infraestrutura', icon: Building, module: null, inDevelopment: true },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasModuleAccess, signOut, isAdmin, user } = useAuth();

  const currentPath = location.pathname;
  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const handleNavigation = (item: NavItem) => {
    const hasAccess = item.module === null || hasModuleAccess(item.module);
    if (hasAccess) {
      navigate(item.url);
    }
  };

  return (
    <aside className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 shrink-0">
      {/* Logo */}
      <div className="mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {mainNavItems.map((item) => {
          const hasAccess = item.module === null || hasModuleAccess(item.module);
          const active = isActive(item.url);

          return (
            <Tooltip key={item.title} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleNavigation(item)}
                  disabled={!hasAccess}
                  className={cn(
                    'sidebar-icon-btn',
                    active && 'active',
                    !hasAccess && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {item.title}
                {!hasAccess && ' (Bloqueado)'}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Separator */}
        <div className="w-8 h-px bg-sidebar-border my-2" />

        {/* Em Desenvolvimento */}
        <div className="flex flex-col items-center gap-1">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="w-8 h-8 flex items-center justify-center">
                <Construction className="h-3 w-3 text-muted-foreground/50" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium text-xs">
              Em Desenvolvimento
            </TooltipContent>
          </Tooltip>

          {devNavItems.map((item) => {
            const active = isActive(item.url);

            return (
              <Tooltip key={item.title} delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate(item.url)}
                    className={cn(
                      'sidebar-icon-btn',
                      active && 'active',
                      'opacity-60 hover:opacity-100'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.title}
                  <span className="text-xs text-muted-foreground ml-1">(Dev)</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-1 pt-4 border-t border-sidebar-border mt-4">
        {isAdmin && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate('/admin')}
                className={cn(
                  'sidebar-icon-btn',
                  currentPath === '/admin' && 'active'
                )}
              >
                <Settings className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Administração
            </TooltipContent>
          </Tooltip>
        )}

        {user && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={signOut}
                className="sidebar-icon-btn text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Sair
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
