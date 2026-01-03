import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DataImportButtonProps {
  dataType: 'towers' | 'ev_stations';
}

const DataImportButton = ({ dataType }: DataImportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      let success = 0;
      let errors = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string | number | null> = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || null;
        });

        try {
          if (dataType === 'towers') {
            const { error } = await supabase.from('towers').insert({
              country_code: row.country_code as string,
              city: row.city as string,
              state: row.state as string,
              latitude: parseFloat(row.latitude as string),
              longitude: parseFloat(row.longitude as string),
              operator: row.operator as string,
              technology: row.technology as string || '5G',
              frequency: row.frequency as string,
              status: row.status as string || 'active',
            });
            if (error) throw error;
          } else {
            const { error } = await supabase.from('ev_stations').insert({
              country_code: row.country_code as string,
              city: row.city as string,
              state: row.state as string,
              latitude: parseFloat(row.latitude as string),
              longitude: parseFloat(row.longitude as string),
              operator: row.operator as string,
              power_kw: row.power_kw ? parseFloat(row.power_kw as string) : null,
              num_chargers: row.num_chargers ? parseInt(row.num_chargers as string) : 1,
              status: row.status as string || 'active',
            });
            if (error) throw error;
          }
          success++;
        } catch {
          errors++;
        }
      }

      setResult({ success, errors });
      toast.success(`Importação concluída: ${success} registros`);
    } catch (error) {
      toast.error('Erro ao processar arquivo');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const label = dataType === 'towers' ? 'Torres 5G' : 'Estações EV';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar {label}</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV com os dados de infraestrutura.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground">Processando...</p>
              </div>
            ) : result ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <p className="text-sm">
                  <span className="text-green-500">{result.success} importados</span>
                  {result.errors > 0 && (
                    <span className="text-destructive ml-2">{result.errors} erros</span>
                  )}
                </p>
                <Button variant="outline" size="sm" onClick={() => setResult(null)}>
                  Importar mais
                </Button>
              </div>
            ) : (
              <div 
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar um arquivo CSV
                </p>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Colunas esperadas:</p>
            {dataType === 'towers' ? (
              <p>country_code, city, state, latitude, longitude, operator, technology, frequency, status</p>
            ) : (
              <p>country_code, city, state, latitude, longitude, operator, power_kw, num_chargers, status</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataImportButton;
