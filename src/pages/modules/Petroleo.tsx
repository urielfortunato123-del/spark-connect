import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel, Construction, Factory, Waves, Droplet, Flame, Ship, ArrowUpDown } from 'lucide-react';

const subcategories = [
  { title: 'Exploração Offshore', icon: Ship, color: 'bg-amber-500' },
  { title: 'Exploração Onshore', icon: Fuel, color: 'bg-amber-600' },
  { title: 'Refino', icon: Factory, color: 'bg-orange-500' },
  { title: 'Petroquímica', icon: Droplet, color: 'bg-yellow-500' },
  { title: 'Oleoduto e Gasoduto', icon: ArrowUpDown, color: 'bg-amber-400' },
  { title: 'Gás - Tratamento', icon: Waves, color: 'bg-orange-400' },
  { title: 'Gás - Processamento', icon: Flame, color: 'bg-red-500' },
  { title: 'Gás - Distribuição', icon: ArrowUpDown, color: 'bg-yellow-600' },
];

export default function Petroleo() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Fuel className="h-7 w-7 text-amber-500" />
            Petróleo & Gás
          </h1>
          <p className="text-muted-foreground mt-1">
            Exploração, refino, petroquímica e distribuição
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

        <Card className="border-dashed border-2 border-amber-500/30 bg-amber-500/5">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
              <Construction className="h-6 w-6 text-amber-500" />
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
