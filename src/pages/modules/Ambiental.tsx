import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TreePine, 
  Construction, 
  FileCheck, 
  ClipboardCheck, 
  Map, 
  Building,
  Truck,
  Waves,
  Factory,
  Home,
  FileText,
  Droplet
} from 'lucide-react';

const subcategories = [
  { title: 'Programas Ambientais', icon: TreePine, color: 'bg-green-500' },
  { title: 'Licenciamento Ambiental', icon: FileCheck, color: 'bg-emerald-500' },
  { title: 'Acompanhamento Ambiental', icon: ClipboardCheck, color: 'bg-teal-500' },
  { title: 'Acompanhamento Ambiental e Patrimonial', icon: Building, color: 'bg-green-600' },
  { title: 'Transportes', icon: Truck, color: 'bg-blue-500' },
  { title: 'Sistemas de Coleta e Tratamento', icon: Waves, color: 'bg-cyan-500' },
  { title: 'Drenagem', icon: Droplet, color: 'bg-sky-500' },
  { title: 'Engenharia Gás e Energia', icon: Factory, color: 'bg-orange-500' },
  { title: 'Urbanização de Favelas', icon: Home, color: 'bg-purple-500' },
  { title: 'Regularização Fundiária', icon: Map, color: 'bg-amber-500' },
  { title: 'Estudos Ambientais', icon: FileText, color: 'bg-lime-500' },
];

export default function Ambiental() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <TreePine className="h-7 w-7 text-green-500" />
            Ambiental
          </h1>
          <p className="text-muted-foreground mt-1">
            Programas, licenciamento e acompanhamento ambiental
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

        <Card className="border-dashed border-2 border-green-500/30 bg-green-500/5">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
              <Construction className="h-6 w-6 text-green-500" />
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
