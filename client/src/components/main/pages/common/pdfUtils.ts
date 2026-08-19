import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

export const exportToPdf = (
  columns: { header: string; accessorKey: string }[],
  data: string[][],
) => {
  const doc = new jsPDF();

  // Define columns and rows for the autoTable
  const tableColumns: string[] = columns.map((col) => col.header);
  const tableRows: string[][] = data;

  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
  });

  doc.save("testout.pdf");
};
