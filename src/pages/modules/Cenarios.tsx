import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function Cenarios() {
  return (
    <AppLayout title="Cenários" subtitle="Simulação de cenários de expansão e investimento">
      <div className="p-6">
        <Card className="glass-card">
          <CardContent className="p-0 h-[600px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Módulo de Cenários</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Em desenvolvimento - simulação de cenários estratégicos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
