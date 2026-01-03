import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Radio, 
  Zap, 
  MapPin, 
  TreePine, 
  BarChart3, 
  FileText, 
  Bot,
  TrendingUp,
  Building2,
  Users,
  Activity,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';

const moduleCards = [
  { 
    title: 'Torres 5G', 
    description: 'Análise de cobertura e expansão de infraestrutura 5G',
    icon: Radio, 
    module: 'torres_5g' as const,
    url: '/torres-5g',
    stats: { value: '42.847', label: 'ERBs mapeadas' },
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  { 
    title: 'Eletropostos', 
    description: 'Mapeamento de estações de recarga para veículos elétricos',
    icon: Zap, 
    module: 'eletropostos' as const,
    url: '/eletropostos',
    stats: { value: '3.256', label: 'Pontos ativos' },
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  },
  { 
    title: 'Viabilidade', 
    description: 'Estudos de viabilidade técnica e econômica',
    icon: MapPin, 
    module: 'viabilidade' as const,
    url: '/viabilidade',
    stats: { value: '847', label: 'Municípios analisados' },
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  { 
    title: 'Ambiental', 
    description: 'Análise de impacto ambiental e licenciamento',
    icon: TreePine, 
    module: 'ambiental' as const,
    url: '/ambiental',
    stats: { value: '156', label: 'Estudos em andamento' },
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  { 
    title: 'Cenários', 
    description: 'Simulação de cenários de expansão e investimento',
    icon: BarChart3, 
    module: 'cenarios' as const,
    url: '/cenarios',
    stats: { value: '24', label: 'Cenários salvos' },
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  { 
    title: 'Relatórios', 
    description: 'Geração de relatórios executivos e técnicos',
    icon: FileText, 
    module: 'relatorios' as const,
    url: '/relatorios',
    stats: { value: '89', label: 'Relatórios gerados' },
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10'
  },
];

const quickStats = [
  { label: 'Municípios Cobertos', value: '4.521', change: '+12%', icon: Building2 },
  { label: 'População Atendida', value: '189M', change: '+8%', icon: Users },
  { label: 'Projetos Ativos', value: '34', change: '+5', icon: Activity },
  { label: 'Última Atualização', value: '2h atrás', icon: Clock },
];

export default function Dashboard() {
  const { user, profile, userPlan, hasModuleAccess } = useAuth();

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral da plataforma">
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Olá, {profile?.full_name || 'Usuário'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo ao InfraBrasil. Aqui está um resumo da sua plataforma.
            </p>
          </div>
          <Button className="gap-2">
            <Bot className="h-4 w-4" />
            Perguntar à IA
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    {stat.change && (
                      <Badge variant="outline" className="mt-2 text-[10px] text-green-400 border-green-400/30 bg-green-400/10">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </Badge>
                    )}
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Module Cards */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Módulos Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moduleCards.map((module) => {
              const hasAccess = hasModuleAccess(module.module);
              
              return (
                <Card 
                  key={module.title} 
                  className={`glass-card-hover transition-all ${!hasAccess ? 'opacity-60' : ''}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${module.bgColor}`}>
                        <module.icon className={`h-5 w-5 ${module.color}`} />
                      </div>
                      {!hasAccess && (
                        <Badge variant="outline" className="text-[10px]">
                          Bloqueado
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base mt-3">{module.title}</CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {module.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div>
                        <p className="text-lg font-bold text-foreground">{module.stats.value}</p>
                        <p className="text-[10px] text-muted-foreground">{module.stats.label}</p>
                      </div>
                      {hasAccess ? (
                        <Button size="sm" variant="ghost" className="gap-1" asChild>
                          <NavLink to={module.url} activeClassName="">
                            Acessar
                            <ArrowUpRight className="h-3 w-3" />
                          </NavLink>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Upgrade
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* AI Assistant Card */}
        <Card className="glass-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">Assistente de IA</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Faça perguntas sobre infraestrutura, obtenha análises e recomendações personalizadas.
                </p>
              </div>
              <Button className="gap-2" asChild>
                <NavLink to="/assistente" activeClassName="">
                  Iniciar Conversa
                  <ArrowUpRight className="h-4 w-4" />
                </NavLink>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
