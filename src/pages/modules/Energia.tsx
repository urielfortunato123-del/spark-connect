import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Construction, Zap, Wind, Sun, Atom, Flame, Cable, Building2 } from 'lucide-react';

const subcategories = [
  { title: 'Linhas de Transmissão', icon: Cable, color: 'bg-yellow-500' },
  { title: 'Subestações', icon: Building2, color: 'bg-yellow-600' },
  { title: 'Geração Hidráulica', icon: Zap, color: 'bg-blue-500' },
  { title: 'Geração Térmica', icon: Flame, color: 'bg-orange-500' },
  { title: 'Geração Nuclear', icon: Atom, color: 'bg-purple-500' },
  { title: 'Geração Eólica', icon: Wind, color: 'bg-cyan-500' },
  { title: 'Geração Solar', icon: Sun, color: 'bg-amber-500' },
  { title: 'Sistemas de Distribuição', icon: Zap, color: 'bg-emerald-500' },
];

export default function Energia() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Lightbulb className="h-7 w-7 text-yellow-500" />
            Energia Elétrica
          </h1>
          <p className="text-muted-foreground mt-1">
            Geração, transmissão e distribuição de energia
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subcategories.map((sub) => (
            <Card 
              key={sub.title} 
              className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className={`w-14 h-14 rounded-xl ${sub.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <sub.icon className={`h-7 w-7 ${sub.color.replace('bg-', 'text-')}`} />
                </div>
                <span className="font-medium text-sm">{sub.title}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-dashed border-2 border-yellow-500/30 bg-yellow-500/5">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-2">
              <Construction className="h-6 w-6 text-yellow-500" />
            </div>
            <CardTitle className="text-lg">Módulo em Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Funcionalidades completas em breve
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
