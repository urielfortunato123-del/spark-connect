import { useState } from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { operatorData, erbsByState, totalERBStats } from "@/data/erbData";
import { evStationsData } from "@/data/evStations";
import { toast } from "@/hooks/use-toast";

type DataType = "5g" | "ev";

interface ExportButtonProps {
  type: DataType;
  selectedOperators?: string[];
}

const ExportButton = ({ type, selectedOperators }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const generateCSV = (data: any[], headers: string[]): string => {
    const headerRow = headers.join(";");
    const rows = data.map(row => 
      headers.map(h => {
        const value = row[h] ?? "";
        // Escape values with semicolons or quotes
        if (typeof value === "string" && (value.includes(";") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(";")
    );
    return [headerRow, ...rows].join("\n");
  };

  const downloadFile = (content: string, filename: string) => {
    // Add BOM for Excel to recognize UTF-8
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportTowersData = async () => {
    setIsExporting(true);
    try {
      // Export operators summary
      const operatorHeaders = ["Operadora", "Total ERBs", "2G", "3G", "4G", "5G", "Crescimento Mensal"];
      const operatorRows = operatorData
        .filter(op => !selectedOperators || selectedOperators.includes(op.operator))
        .map(op => ({
          "Operadora": op.operator,
          "Total ERBs": op.total,
          "2G": op.erbs2G,
          "3G": op.erbs3G,
          "4G": op.erbs4G,
          "5G": op.erbs5G,
          "Crescimento Mensal": op.growth,
        }));

      const operatorCSV = generateCSV(operatorRows, operatorHeaders);
      downloadFile(operatorCSV, `torres_5g_operadoras_${new Date().toISOString().split("T")[0]}.csv`);

      // Export by state
      const stateHeaders = ["Estado", "UF", "Total ERBs", "Latitude", "Longitude"];
      const stateRows = erbsByState.map(state => ({
        "Estado": state.state,
        "UF": state.stateCode,
        "Total ERBs": state.total,
        "Latitude": state.lat,
        "Longitude": state.lng,
      }));

      const stateCSV = generateCSV(stateRows, stateHeaders);
      downloadFile(stateCSV, `torres_5g_estados_${new Date().toISOString().split("T")[0]}.csv`);

      toast({
        title: "Exportação concluída",
        description: "2 arquivos CSV foram baixados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportEVData = async () => {
    setIsExporting(true);
    try {
      const headers = [
        "Nome", "Endereço", "Cidade", "Estado", "Operador", 
        "Conectores", "Carregadores", "Potência", "Público", "24h",
        "Latitude", "Longitude"
      ];
      
      const rows = evStationsData.map(station => ({
        "Nome": station.name,
        "Endereço": station.address,
        "Cidade": station.city,
        "Estado": station.state,
        "Operador": station.operator,
        "Conectores": station.connectors.join(", "),
        "Carregadores": station.chargers,
        "Potência": station.power,
        "Público": station.isPublic ? "Sim" : "Não",
        "24h": station.is24h ? "Sim" : "Não",
        "Latitude": station.lat,
        "Longitude": station.lng,
      }));

      const csv = generateCSV(rows, headers);
      downloadFile(csv, `estacoes_ev_${new Date().toISOString().split("T")[0]}.csv`);

      toast({
        title: "Exportação concluída",
        description: `${evStationsData.length} estações EV exportadas com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (type === "5g") {
      exportTowersData();
    } else {
      exportEVData();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2 text-xs h-8"
    >
      {isExporting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      Exportar CSV
    </Button>
  );
};

export default ExportButton;
