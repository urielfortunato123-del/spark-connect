import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Map, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { operatorData, erbsByState, totalERBStats, historicalData, erbsByRegion } from "@/data/erbData";
import { evStationsData } from "@/data/evStations";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type DataType = "5g" | "ev";
type ExportFormat = "csv" | "geojson" | "pdf";

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
        if (typeof value === "string" && (value.includes(";") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(";")
    );
    return [headerRow, ...rows].join("\n");
  };

  const downloadFile = (content: string | Blob, filename: string, mimeType?: string) => {
    const BOM = "\uFEFF";
    const blob = content instanceof Blob 
      ? content 
      : new Blob([mimeType?.includes("json") ? content : BOM + content], { type: mimeType || "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ============ CSV EXPORTS ============
  const exportTowersCSV = async () => {
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
    downloadFile(operatorCSV, `torres_5g_operadoras_brasil_${new Date().toISOString().split("T")[0]}.csv`);

    const stateHeaders = ["Estado", "UF", "Total ERBs", "Latitude", "Longitude"];
    const stateRows = erbsByState.map(state => ({
      "Estado": state.state,
      "UF": state.stateCode,
      "Total ERBs": state.total,
      "Latitude": state.lat,
      "Longitude": state.lng,
    }));

    const stateCSV = generateCSV(stateRows, stateHeaders);
    downloadFile(stateCSV, `torres_5g_estados_brasil_${new Date().toISOString().split("T")[0]}.csv`);

    return 2;
  };

  const exportEVCSV = async () => {
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
    downloadFile(csv, `estacoes_ev_brasil_${new Date().toISOString().split("T")[0]}.csv`);
    return 1;
  };

  // ============ GEOJSON EXPORTS ============
  const exportTowersGeoJSON = async () => {
    const features = erbsByState.map(state => ({
      type: "Feature" as const,
      properties: {
        name: state.state,
        code: state.stateCode,
        total_erbs: state.total,
        category: "telecom_tower",
        data_source: "Anatel/Teleco",
        update_date: totalERBStats.lastUpdate,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [state.lng, state.lat]
      }
    }));

    const geojson = {
      type: "FeatureCollection",
      name: "Torres_5G_Brasil",
      crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
      features,
      metadata: {
        title: "Torres de Telecomunicação 5G - Brasil",
        description: "Distribuição de ERBs por estado brasileiro",
        total_towers: totalERBStats.total,
        total_5g: totalERBStats.erbs5G,
        generated_at: new Date().toISOString(),
        source: "InfraBrasil Platform",
      }
    };

    downloadFile(
      JSON.stringify(geojson, null, 2), 
      `torres_5g_brasil_${new Date().toISOString().split("T")[0]}.geojson`,
      "application/geo+json"
    );
  };

  const exportEVGeoJSON = async () => {
    const features = evStationsData.map((station, idx) => ({
      type: "Feature" as const,
      properties: {
        id: idx + 1,
        name: station.name,
        address: station.address,
        city: station.city,
        state: station.state,
        operator: station.operator,
        connectors: station.connectors,
        chargers: station.chargers,
        power_kw: station.power,
        is_public: station.isPublic,
        is_24h: station.is24h,
        category: "ev_charging_station",
      },
      geometry: {
        type: "Point" as const,
        coordinates: [station.lng, station.lat]
      }
    }));

    const geojson = {
      type: "FeatureCollection",
      name: "Estacoes_EV_Brasil",
      crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
      features,
      metadata: {
        title: "Estações de Recarga de Veículos Elétricos - Brasil",
        description: "Pontos de recarga para veículos elétricos no território brasileiro",
        total_stations: evStationsData.length,
        generated_at: new Date().toISOString(),
        source: "InfraBrasil Platform",
      }
    };

    downloadFile(
      JSON.stringify(geojson, null, 2), 
      `estacoes_ev_brasil_${new Date().toISOString().split("T")[0]}.geojson`,
      "application/geo+json"
    );
  };

  // ============ PDF INSTITUTIONAL REPORT ============
  const generateTowersPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = new Date().toLocaleDateString("pt-BR");
    
    // Header
    doc.setFillColor(20, 83, 45); // Green
    doc.rect(0, 0, pageWidth, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("InfraBrasil", 20, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Relatório de Infraestrutura de Telecomunicações", 20, 30);
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${today}`, pageWidth - 60, 30);
    
    // Summary Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Executivo", 20, 55);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summaryY = 65;
    doc.text(`Total de ERBs no Brasil: ${totalERBStats.total.toLocaleString("pt-BR")}`, 20, summaryY);
    doc.text(`ERBs 5G: ${totalERBStats.erbs5G.toLocaleString("pt-BR")} (${((totalERBStats.erbs5G / totalERBStats.total) * 100).toFixed(1)}%)`, 20, summaryY + 7);
    doc.text(`Crescimento mensal: +${totalERBStats.monthlyGrowth} torres`, 20, summaryY + 14);
    doc.text(`Última atualização: ${totalERBStats.lastUpdate}`, 20, summaryY + 21);
    
    // Operators Table
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Distribuição por Operadora", 20, 100);
    
    const operatorTableData = operatorData
      .filter(op => !selectedOperators || selectedOperators.includes(op.operator))
      .map(op => [
        op.operator,
        op.total.toLocaleString("pt-BR"),
        op.erbs5G.toLocaleString("pt-BR"),
        `${((op.erbs5G / op.total) * 100).toFixed(1)}%`,
        `+${op.growth}`
      ]);
    
    autoTable(doc, {
      startY: 105,
      head: [["Operadora", "Total ERBs", "ERBs 5G", "% 5G", "Cresc. Mensal"]],
      body: operatorTableData,
      theme: "striped",
      headStyles: { fillColor: [20, 83, 45] },
      styles: { fontSize: 9 },
    });
    
    // States Table (top 10)
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Top 10 Estados por Cobertura", 20, finalY);
    
    const stateTableData = erbsByState.slice(0, 10).map((state, idx) => [
      `${idx + 1}º`,
      state.state,
      state.stateCode,
      state.total.toLocaleString("pt-BR"),
      `${((state.total / totalERBStats.total) * 100).toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [["Rank", "Estado", "UF", "Total ERBs", "% do Total"]],
      body: stateTableData,
      theme: "striped",
      headStyles: { fillColor: [20, 83, 45] },
      styles: { fontSize: 9 },
    });
    
    // New page for evolution
    doc.addPage();
    
    // Evolution Header
    doc.setFillColor(20, 83, 45);
    doc.rect(0, 0, pageWidth, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Evolução Histórica", 20, 17);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Crescimento Anual de ERBs", 20, 40);
    
    const evolutionData = historicalData.map(h => [
      h.year,
      h.total.toLocaleString("pt-BR"),
      h.erbs5G.toLocaleString("pt-BR"),
      `${((h.erbs5G / h.total) * 100).toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      startY: 45,
      head: [["Ano", "Total ERBs", "ERBs 5G", "% 5G"]],
      body: evolutionData,
      theme: "striped",
      headStyles: { fillColor: [20, 83, 45] },
      styles: { fontSize: 10 },
    });
    
    // Regional distribution
    const evoFinalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Distribuição por Região Anatel", 20, evoFinalY);
    
    const regionData = erbsByRegion.map(r => [
      r.region,
      r.total.toLocaleString("pt-BR"),
      `${((r.total / totalERBStats.total) * 100).toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      startY: evoFinalY + 5,
      head: [["Região", "Total ERBs", "% do Total"]],
      body: regionData,
      theme: "striped",
      headStyles: { fillColor: [20, 83, 45] },
      styles: { fontSize: 9 },
    });
    
    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `InfraBrasil - Plataforma de Infraestrutura Nacional | Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }
    
    doc.save(`relatorio_torres_brasil_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const generateEVPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = new Date().toLocaleDateString("pt-BR");
    
    // Header
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(0, 0, pageWidth, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("InfraBrasil", 20, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Relatório de Estações de Recarga EV", 20, 30);
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${today}`, pageWidth - 60, 30);
    
    // Summary
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Executivo", 20, 55);
    
    const totalChargers = evStationsData.reduce((acc, s) => acc + s.chargers, 0);
    const publicStations = evStationsData.filter(s => s.isPublic).length;
    const stations24h = evStationsData.filter(s => s.is24h).length;
    const operators = [...new Set(evStationsData.map(s => s.operator))];
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summaryY = 65;
    doc.text(`Total de estações: ${evStationsData.length}`, 20, summaryY);
    doc.text(`Total de carregadores: ${totalChargers}`, 20, summaryY + 7);
    doc.text(`Estações públicas: ${publicStations} (${((publicStations / evStationsData.length) * 100).toFixed(0)}%)`, 20, summaryY + 14);
    doc.text(`Estações 24h: ${stations24h}`, 20, summaryY + 21);
    doc.text(`Operadores: ${operators.length}`, 20, summaryY + 28);
    
    // Operators distribution
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Distribuição por Operador", 20, 105);
    
    const operatorCounts = operators.map(op => {
      const count = evStationsData.filter(s => s.operator === op).length;
      const chargers = evStationsData.filter(s => s.operator === op).reduce((acc, s) => acc + s.chargers, 0);
      return [op, count.toString(), chargers.toString(), `${((count / evStationsData.length) * 100).toFixed(1)}%`];
    }).sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
    
    autoTable(doc, {
      startY: 110,
      head: [["Operador", "Estações", "Carregadores", "% do Total"]],
      body: operatorCounts,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    });
    
    // States distribution
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Distribuição por Estado", 20, finalY);
    
    const stateCounts: Record<string, { count: number; chargers: number }> = {};
    evStationsData.forEach(s => {
      if (!stateCounts[s.state]) stateCounts[s.state] = { count: 0, chargers: 0 };
      stateCounts[s.state].count++;
      stateCounts[s.state].chargers += s.chargers;
    });
    
    const stateData = Object.entries(stateCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([state, data], idx) => [
        `${idx + 1}º`,
        state,
        data.count.toString(),
        data.chargers.toString(),
        `${((data.count / evStationsData.length) * 100).toFixed(1)}%`
      ]);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [["Rank", "Estado", "Estações", "Carregadores", "% do Total"]],
      body: stateData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    });
    
    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `InfraBrasil - Plataforma de Infraestrutura Nacional | Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }
    
    doc.save(`relatorio_ev_brasil_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // ============ EXPORT HANDLERS ============
  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      if (type === "5g") {
        switch (format) {
          case "csv":
            const csvCount = await exportTowersCSV();
            toast({
              title: "Exportação CSV concluída",
              description: `${csvCount} arquivos baixados com sucesso.`,
            });
            break;
          case "geojson":
            await exportTowersGeoJSON();
            toast({
              title: "Exportação GeoJSON concluída",
              description: "Arquivo pronto para uso em sistemas GIS.",
            });
            break;
          case "pdf":
            await generateTowersPDF();
            toast({
              title: "Relatório PDF gerado",
              description: "Relatório institucional pronto para download.",
            });
            break;
        }
      } else {
        switch (format) {
          case "csv":
            await exportEVCSV();
            toast({
              title: "Exportação CSV concluída",
              description: `${evStationsData.length} estações exportadas.`,
            });
            break;
          case "geojson":
            await exportEVGeoJSON();
            toast({
              title: "Exportação GeoJSON concluída",
              description: "Arquivo pronto para uso em sistemas GIS.",
            });
            break;
          case "pdf":
            await generateEVPDF();
            toast({
              title: "Relatório PDF gerado",
              description: "Relatório institucional pronto para download.",
            });
            break;
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className="gap-2 text-xs h-8"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          Exportar
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleExport("csv")} className="cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          <div>
            <p className="font-medium">CSV (Excel)</p>
            <p className="text-xs text-muted-foreground">Planilha de dados</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("geojson")} className="cursor-pointer">
          <Map className="w-4 h-4 mr-2" />
          <div>
            <p className="font-medium">GeoJSON</p>
            <p className="text-xs text-muted-foreground">Para sistemas GIS</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer">
          <FileText className="w-4 h-4 mr-2" />
          <div>
            <p className="font-medium">PDF Institucional</p>
            <p className="text-xs text-muted-foreground">Relatório completo</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
