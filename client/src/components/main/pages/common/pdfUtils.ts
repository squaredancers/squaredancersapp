import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

export const exportToPdf = (
  title: string,
  columns: string[],
  data: string[][],
  usePortrait: boolean = true,
  useBorders: boolean = false,
) => {
  const doc = new jsPDF({
    orientation: usePortrait ? "portrait" : "landscape",
  });

  // Define columns and rows for the autoTable
  const tableColumns: string[] = columns;
  const tableRows: string[][] = data;

  doc.text(title, 14, 30);

  autoTable(doc, {
    startY: 38,
    head: [tableColumns],
    body: tableRows,
    margin: { bottom: 20, right: 5 },
    styles: {
      fillColor: false, // Removes background fill
      textColor: [0, 0, 0], // Forces solid true black
      lineWidth: useBorders ? 0.5 : 0.0, // Border thickness in mm
      lineColor: [0, 0, 0], // RGB border color (black)
    },
  });

  doc.save(`${title}.pdf`);
};
