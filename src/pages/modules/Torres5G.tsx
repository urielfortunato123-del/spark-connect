import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, ArrowUp, ArrowDown, Minus } from 'lucide-react';

// Placeholder page for Torres 5G module
export default function Torres5G() {
  return (
    <AppLayout title="Torres 5G" subtitle="Análise de cobertura e infraestrutura">
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total de ERBs', value: '42.847', change: 12.5, icon: Radio },
            { label: 'Cobertura 5G', value: '68%', change: 5.2, icon: Radio },
            { label: 'Municípios Atendidos', value: '3.847', change: 0, icon: Radio },
            { label: 'Operadoras Ativas', value: '6', change: -1, icon: Radio },
          ].map((stat, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.change > 0 ? (
                        <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30 bg-green-400/10">
                          <ArrowUp className="h-3 w-3 mr-0.5" />
                          {stat.change}%
                        </Badge>
                      ) : stat.change < 0 ? (
                        <Badge variant="outline" className="text-[10px] text-red-400 border-red-400/30 bg-red-400/10">
                          <ArrowDown className="h-3 w-3 mr-0.5" />
                          {Math.abs(stat.change)}%
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          <Minus className="h-3 w-3 mr-0.5" />
                          Estável
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <stat.icon className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map Placeholder */}
        <Card className="glass-card">
          <CardContent className="p-0 h-[500px] flex items-center justify-center">
            <div className="text-center">
              <Radio className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Mapa de Torres 5G</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Em desenvolvimento - visualização de ERBs e cobertura
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
