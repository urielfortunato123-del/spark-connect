import { useMemo, useRef, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
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

type ParsedRow = Record<string, string | number | null>;

function normalizeHeader(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function cleanCell(value: unknown) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;
  return str.replace(/^"|"$/g, '').trim();
}

function detectDelimiter(headerLine: string) {
  const commas = (headerLine.match(/,/g) || []).length;
  const semis = (headerLine.match(/;/g) || []).length;
  return semis > commas ? ';' : ',';
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0]
    .split(delimiter)
    .map((h) => normalizeHeader(h));

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter);
    const row: ParsedRow = {};
    headers.forEach((h, idx) => {
      row[h] = cleanCell(values[idx]);
    });
    rows.push(row);
  }

  return rows;
}

function parseXLSX(buffer: ArrayBuffer): ParsedRow[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) return [];
  const sheet = wb.Sheets[firstSheetName];

  // We read as arrays to normalize header ourselves.
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null });
  if (!aoa.length || !Array.isArray(aoa[0])) return [];

  const rawHeaders = (aoa[0] as unknown[]).map(normalizeHeader);
  const rows: ParsedRow[] = [];

  for (let r = 1; r < aoa.length; r++) {
    const rowArr = aoa[r] as unknown[];
    const row: ParsedRow = {};
    rawHeaders.forEach((h, idx) => {
      row[h] = cleanCell(rowArr?.[idx]);
    });
    // Ignore fully empty rows
    if (Object.values(row).some((v) => v !== null && String(v).trim() !== '')) rows.push(row);
  }

  return rows;
}

function getFirstMatch(row: ParsedRow, candidates: string[]) {
  for (const key of candidates) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') return row[key];
  }
  return null;
}

function toNumber(value: unknown) {
  const str = String(value ?? '').trim().replace(',', '.');
  const n = Number(str);
  return Number.isFinite(n) ? n : null;
}

const DataImportButton = ({ dataType }: DataImportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const label = useMemo(() => (dataType === 'towers' ? 'Torres 5G' : 'Estações EV'), [dataType]);

  const expectedColumns = useMemo(() => {
    if (dataType === 'towers') {
      return 'country_code, city, state, latitude, longitude, operator (opcionais: technology, frequency, status)';
    }
    return 'country_code, city, state, latitude, longitude, operator (opcionais: power_kw, num_chargers, status)';
  }, [dataType]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let rows: ParsedRow[] = [];

      if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        rows = parseXLSX(buffer);
      } else {
        const text = await file.text();
        rows = parseCSV(text);
      }

      if (!rows.length) {
        toast.error('Arquivo vazio ou formato inválido');
        return;
      }

      // Map headers flexíveis (útil para planilhas brasileiras)
      const mapped = rows.map((row) => {
        const country_code = getFirstMatch(row, ['country_code', 'pais', 'country', 'countrycode']);
        const city = getFirstMatch(row, ['city', 'cidade', 'municipio', 'município']);
        const state = getFirstMatch(row, ['state', 'estado', 'uf']);
        const latitude = toNumber(getFirstMatch(row, ['latitude', 'lat']));
        const longitude = toNumber(getFirstMatch(row, ['longitude', 'lon', 'lng']));
        const operator = getFirstMatch(row, ['operator', 'operadora', 'operador', 'carrier']);

        return {
          country_code: country_code ? String(country_code).trim().toUpperCase() : null,
          city: city ? String(city).trim() : null,
          state: state ? String(state).trim() : null,
          latitude,
          longitude,
          operator: operator ? String(operator).trim() : null,

          // Extras
          technology: getFirstMatch(row, ['technology', 'tecnologia']),
          frequency: getFirstMatch(row, ['frequency', 'frequencia', 'frequência']),
          status: getFirstMatch(row, ['status', 'situacao', 'situação']),
          power_kw: toNumber(getFirstMatch(row, ['power_kw', 'power', 'potencia', 'potência'])),
          num_chargers: toNumber(getFirstMatch(row, ['num_chargers', 'chargers', 'conectores', 'pontos'])),
        };
      });

      // Validate minimally
      const validRows = mapped.filter((r) => r.country_code && r.latitude !== null && r.longitude !== null);
      const invalidCount = mapped.length - validRows.length;

      let success = 0;
      let errors = invalidCount;

      const batchSize = 300;
      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize);

        if (dataType === 'towers') {
          const payload = batch.map((r) => ({
            country_code: r.country_code as string,
            city: r.city,
            state: r.state,
            latitude: r.latitude as number,
            longitude: r.longitude as number,
            operator: r.operator,
            technology: r.technology ? String(r.technology) : '5G',
            frequency: r.frequency ? String(r.frequency) : null,
            status: r.status ? String(r.status) : 'active',
          }));

          const { error } = await supabase.from('towers').insert(payload);
          if (error) {
            errors += payload.length;
          } else {
            success += payload.length;
          }
        } else {
          const payload = batch.map((r) => ({
            country_code: r.country_code as string,
            city: r.city,
            state: r.state,
            latitude: r.latitude as number,
            longitude: r.longitude as number,
            operator: r.operator,
            power_kw: r.power_kw,
            num_chargers: r.num_chargers !== null ? Math.max(1, Math.trunc(r.num_chargers)) : 1,
            status: r.status ? String(r.status) : 'active',
          }));

          const { error } = await supabase.from('ev_stations').insert(payload);
          if (error) {
            errors += payload.length;
          } else {
            success += payload.length;
          }
        }
      }

      setResult({ success, errors });
      if (success > 0) toast.success(`Importação concluída: ${success} registros`);
      if (success === 0 && errors > 0) toast.error('Nenhum registro foi importado (verifique as colunas e valores)');

      // Reset input so selecting same file again triggers change
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error('Erro ao processar arquivo');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

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
            Faça upload de um arquivo CSV ou XLSX com os dados de infraestrutura.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept={dataType === 'towers' ? '.csv,.xlsx,.xls' : '.csv,.xlsx,.xls'}
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
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                }}
              >
                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Clique para selecionar um arquivo (CSV ou XLSX)</p>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Colunas esperadas (mínimo):</p>
            <p>{expectedColumns}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataImportButton;
