import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Construction } from 'lucide-react';

export default function Saneamento() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Droplets className="h-7 w-7 text-cyan-500" />
            Saneamento Básico
          </h1>
          <p className="text-muted-foreground mt-1">
            Água, esgoto e resíduos sólidos
          </p>
        </div>

        <Card className="border-dashed border-2 border-cyan-500/30 bg-cyan-500/5">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
              <Construction className="h-8 w-8 text-cyan-500" />
            </div>
            <CardTitle className="text-xl">Módulo em Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground space-y-4">
            <p>
              Este módulo está sendo desenvolvido e incluirá funcionalidades para:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Cobertura de água e esgoto por município
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Estações de tratamento (ETA/ETE)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Indicadores do Marco Legal do Saneamento
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Gestão de resíduos sólidos
              </li>
            </ul>
            <p className="text-sm text-muted-foreground/70 pt-4">
              Previsão: Futuro próximo
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
