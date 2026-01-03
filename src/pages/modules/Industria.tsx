import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory, Construction, FileStack, Boxes, Leaf, Fuel, Beaker } from 'lucide-react';

const subcategories = [
  { title: 'Papel e Celulose', icon: FileStack, color: 'bg-amber-600' },
  { title: 'Cimento', icon: Boxes, color: 'bg-stone-500' },
  { title: 'Fertilizantes', icon: Leaf, color: 'bg-green-500' },
  { title: 'Biocombustíveis', icon: Fuel, color: 'bg-emerald-500' },
  { title: 'Petroquímica', icon: Beaker, color: 'bg-purple-500' },
];

export default function Industria() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <Factory className="h-7 w-7 text-indigo-500" />
            Indústria
          </h1>
          <p className="text-muted-foreground mt-1">
            Papel e celulose, cimento, fertilizantes e biocombustíveis
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

        <Card className="border-dashed border-2 border-indigo-500/30 bg-indigo-500/5">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2">
              <Construction className="h-6 w-6 text-indigo-500" />
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
