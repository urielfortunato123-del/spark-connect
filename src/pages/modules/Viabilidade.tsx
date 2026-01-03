import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export default function Viabilidade() {
  return (
    <AppLayout title="Viabilidade" subtitle="Estudos de viabilidade técnica e econômica">
      <div className="p-6">
        <Card className="glass-card">
          <CardContent className="p-0 h-[600px] flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Módulo de Viabilidade</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Em desenvolvimento - análise de viabilidade para novos projetos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
