import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { TreePine } from 'lucide-react';

export default function Ambiental() {
  return (
    <AppLayout title="Ambiental" subtitle="Análise de impacto ambiental e licenciamento">
      <div className="p-6">
        <Card className="glass-card">
          <CardContent className="p-0 h-[600px] flex items-center justify-center">
            <div className="text-center">
              <TreePine className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Módulo Ambiental</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Em desenvolvimento - estudos ambientais e licenciamento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
