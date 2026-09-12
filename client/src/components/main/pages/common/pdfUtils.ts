import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

export const exportToPdf = (
  title: string,
  columns: string[],
  data: string[][],
) => {
  const doc = new jsPDF();

  // Define columns and rows for the autoTable
  const tableColumns: string[] = columns;
  const tableRows: string[][] = data;

  doc.text(title, 14, 30);

  autoTable(doc, {
    startY: 38,
    head: [tableColumns],
    body: tableRows,
  });

  doc.save(`${title}.pdf`);
};
