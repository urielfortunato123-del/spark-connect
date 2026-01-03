import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, ArrowUp, Battery, MapPin } from 'lucide-react';

export default function Eletropostos() {
  return (
    <AppLayout title="Eletropostos" subtitle="Infraestrutura de recarga para veículos elétricos">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total de Estações', value: '3.256', change: 23.4, icon: Zap },
            { label: 'Carregadores', value: '8.412', change: 18.7, icon: Battery },
            { label: 'Municípios com EV', value: '847', change: 15.2, icon: MapPin },
            { label: 'Potência Total (MW)', value: '156.8', change: 28.1, icon: Zap },
          ].map((stat, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    <Badge variant="outline" className="mt-2 text-[10px] text-green-400 border-green-400/30 bg-green-400/10">
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                      {stat.change}%
                    </Badge>
                  </div>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <stat.icon className="h-4 w-4 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card">
          <CardContent className="p-0 h-[500px] flex items-center justify-center">
            <div className="text-center">
              <Zap className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Mapa de Eletropostos</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Em desenvolvimento - visualização de estações de recarga
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
