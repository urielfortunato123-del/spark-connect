import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function Relatorios() {
  return (
    <AppLayout title="Relatórios" subtitle="Geração de relatórios executivos e técnicos">
      <div className="p-6">
        <Card className="glass-card">
          <CardContent className="p-0 h-[600px] flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Módulo de Relatórios</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Em desenvolvimento - geração de relatórios personalizados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
