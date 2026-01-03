import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  MapPin,
  Zap,
  Radio,
  FileCheck,
  Clock,
  Eye
} from 'lucide-react';

const reportTypes = [
  { 
    title: 'Relatório de Cobertura 5G',
    description: 'Análise completa de cobertura por estado e município',
    icon: Radio,
    color: 'bg-blue-500',
    status: 'available',
    date: '03/01/2026'
  },
  { 
    title: 'Mapa de Eletropostos',
    description: 'Distribuição geográfica e análise de densidade',
    icon: Zap,
    color: 'bg-green-500',
    status: 'available',
    date: '02/01/2026'
  },
  { 
    title: 'Vazios Territoriais',
    description: 'Identificação de áreas sem infraestrutura adequada',
    icon: MapPin,
    color: 'bg-orange-500',
    status: 'available',
    date: '01/01/2026'
  },
  { 
    title: 'Análise de Mercado EV',
    description: 'Tendências e projeções do mercado de veículos elétricos',
    icon: BarChart3,
    color: 'bg-purple-500',
    status: 'generating',
    date: '-'
  },
  { 
    title: 'Relatório Regulatório',
    description: 'Atualizações de ANATEL, ANEEL e outras agências',
    icon: FileCheck,
    color: 'bg-amber-500',
    status: 'scheduled',
    date: '10/01/2026'
  },
];

const recentReports = [
  { name: 'relatorio_5g_dez2025.pdf', size: '2.4 MB', date: '28/12/2025', downloads: 47 },
  { name: 'eletropostos_brasil_q4.pdf', size: '1.8 MB', date: '22/12/2025', downloads: 89 },
  { name: 'vazios_territoriais_norte.pdf', size: '3.1 MB', date: '18/12/2025', downloads: 34 },
  { name: 'projecoes_2026_telecom.pdf', size: '1.2 MB', date: '15/12/2025', downloads: 156 },
];

export default function Relatorios() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
              <FileText className="h-7 w-7 text-cyan-500" />
              Relatórios
            </h1>
            <p className="text-muted-foreground mt-1">
              Geração e download de relatórios de infraestrutura
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => (
            <Card key={report.title} className="glass-card hover:border-primary/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${report.color}/10 flex items-center justify-center`}>
                    <report.icon className={`h-6 w-6 ${report.color.replace('bg-', 'text-')}`} />
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      report.status === 'available' ? 'text-green-500 border-green-500/30' :
                      report.status === 'generating' ? 'text-amber-500 border-amber-500/30' :
                      'text-muted-foreground'
                    }
                  >
                    {report.status === 'available' ? 'Disponível' :
                     report.status === 'generating' ? 'Gerando...' : 'Agendado'}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-1">{report.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {report.date}
                  </span>
                  {report.status === 'available' && (
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
                  {report.status === 'generating' && (
                    <Button size="sm" variant="outline" disabled>
                      <Clock className="h-3 w-3 mr-1 animate-spin" />
                      Aguarde
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Reports */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-500" />
              Relatórios Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <FileText className="h-4 w-4 text-cyan-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.size} • {report.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      {report.downloads}
                    </Badge>
                    <Button size="icon" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-cyan-500">156</p>
              <p className="text-sm text-muted-foreground">Relatórios gerados</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-500">1.2K</p>
              <p className="text-sm text-muted-foreground">Downloads total</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-500">24</p>
              <p className="text-sm text-muted-foreground">Usuários ativos</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-500">5</p>
              <p className="text-sm text-muted-foreground">Agendados</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
