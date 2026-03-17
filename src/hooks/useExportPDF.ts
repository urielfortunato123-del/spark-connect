import { useCallback } from 'react';
import { toast } from 'sonner';

interface ExportPDFParams {
  title: string;
  subtitle?: string;
  moduleName: string;
  projectData: {
    nome?: string;
    categoria?: string;
    subtipo?: string;
    municipio?: string;
    estado?: string;
    capacidade?: string;
    descricao?: string;
    [key: string]: any;
  };
  analysisContent: string;
}

export function useExportPDF() {
  const exportPDF = useCallback(async ({
    title,
    subtitle,
    moduleName,
    projectData,
    analysisContent,
  }: ExportPDFParams) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const addPageIfNeeded = (needed: number) => {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          y = margin;
          // Footer on new page
          addFooter();
        }
      };

      const addFooter = () => {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `InfraBrasil - ${moduleName} | Página ${pageCount}`,
          pageWidth / 2, pageHeight - 10, { align: 'center' }
        );
        doc.text(
          new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
          pageWidth - margin, pageHeight - 10, { align: 'right' }
        );
      };

      // ---- Header bar ----
      doc.setFillColor(17, 24, 39); // dark bg
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setFillColor(34, 197, 94); // green accent
      doc.rect(0, 38, pageWidth, 2, 'F');

      doc.setTextColor(255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('InfraBrasil', margin, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(moduleName, margin, 28);

      doc.setFontSize(9);
      doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - margin, 28, { align: 'right' });

      y = 50;

      // ---- Title ----
      doc.setTextColor(17, 24, 39);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, y);
      y += 8;

      if (subtitle) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(subtitle, margin, y);
        y += 10;
      }

      // ---- Project Info Box ----
      y += 2;
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'F');
      doc.setDrawColor(220);
      doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'S');

      const infoY = y + 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60);

      const col1 = margin + 5;
      const col2 = margin + contentWidth / 2;

      const infoFields: [string, string | undefined][] = [
        ['Projeto:', projectData.nome],
        ['Categoria:', projectData.categoria],
        ['Subtipo:', projectData.subtipo],
        ['Localização:', projectData.municipio && projectData.estado ? `${projectData.municipio} / ${projectData.estado}` : projectData.estado],
        ['Capacidade:', projectData.capacidade],
        ['Operador:', projectData.operador],
      ].filter(([, v]) => v) as [string, string][];

      infoFields.forEach(([label, value], i) => {
        const col = i % 2 === 0 ? col1 : col2;
        const row = infoY + Math.floor(i / 2) * 9;
        doc.setFont('helvetica', 'bold');
        doc.text(label, col, row);
        doc.setFont('helvetica', 'normal');
        doc.text(value || '', col + doc.getTextWidth(label) + 2, row);
      });

      y += 44;

      // ---- Separator ----
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // ---- Analysis Title ----
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text('Análise de Viabilidade - IA', margin, y);
      y += 8;

      // ---- Analysis Content ----
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40);

      // Parse markdown-like content
      const lines = analysisContent.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
          y += 4;
          continue;
        }

        // Headers
        if (trimmed.startsWith('### ')) {
          addPageIfNeeded(12);
          y += 4;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(17, 24, 39);
          doc.text(trimmed.replace('### ', ''), margin, y);
          y += 7;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(40);
          continue;
        }

        if (trimmed.startsWith('## ')) {
          addPageIfNeeded(14);
          y += 6;
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(17, 24, 39);
          doc.text(trimmed.replace('## ', ''), margin, y);
          y += 8;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(40);
          continue;
        }

        if (trimmed.startsWith('# ')) {
          addPageIfNeeded(16);
          y += 8;
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(17, 24, 39);
          doc.text(trimmed.replace('# ', ''), margin, y);
          y += 10;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(40);
          continue;
        }

        // Bold lines (e.g. **text**)
        const isBold = trimmed.startsWith('**') && trimmed.endsWith('**');
        if (isBold) {
          addPageIfNeeded(7);
          doc.setFont('helvetica', 'bold');
          doc.text(trimmed.replace(/\*\*/g, ''), margin, y);
          doc.setFont('helvetica', 'normal');
          y += 6;
          continue;
        }

        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[-•*]\s+/, '');
          const cleanText = bulletText.replace(/\*\*/g, '');
          const wrapped = doc.splitTextToSize(cleanText, contentWidth - 8);
          addPageIfNeeded(wrapped.length * 5 + 2);
          
          doc.setFillColor(34, 197, 94);
          doc.circle(margin + 2, y - 1.2, 1, 'F');
          doc.text(wrapped, margin + 6, y);
          y += wrapped.length * 5 + 2;
          continue;
        }

        // Regular text - word wrap
        const cleanLine = trimmed.replace(/\*\*/g, '');
        const wrapped = doc.splitTextToSize(cleanLine, contentWidth);
        addPageIfNeeded(wrapped.length * 5);
        doc.text(wrapped, margin, y);
        y += wrapped.length * 5 + 2;
      }

      // Add footer to all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `InfraBrasil - ${moduleName} | Página ${i} de ${totalPages}`,
          pageWidth / 2, pageHeight - 10, { align: 'center' }
        );
      }

      // Save
      const fileName = `InfraBrasil_${moduleName.replace(/[^a-zA-Z0-9]/g, '_')}_${projectData.nome?.replace(/[^a-zA-Z0-9]/g, '_') || 'relatorio'}.pdf`;
      doc.save(fileName);

      toast.success('PDF exportado com sucesso!');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Erro ao exportar PDF. Tente novamente.');
    }
  }, []);

  return { exportPDF };
}
