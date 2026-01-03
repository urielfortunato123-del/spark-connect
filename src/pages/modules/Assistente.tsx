import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export default function Assistente() {
  return (
    <AppLayout title="Assistente IA" subtitle="Inteligência artificial para análise de infraestrutura">
      <div className="p-6">
        <Card className="glass-card">
          <CardContent className="p-0 h-[600px] flex items-center justify-center">
            <div className="text-center">
              <Bot className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Assistente de IA</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Em desenvolvimento - chat inteligente para análises
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
