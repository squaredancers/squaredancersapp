import { create } from "zustand";
import { exportToPdf } from "../components/main/pages/common/pdfUtils.js";

interface DialogStore {
  isOpen: boolean;
  headers: { name: string; show: boolean }[];
  title: string;
  rows: string[][];
  showRowNum: boolean;

  setOpen: (isOpen: boolean) => void;
  setTitle: (title: string) => void;
  setHeadersAndRows: (
    headerNames: string[],
    rows: string[][],
    showRowNum: boolean,
  ) => void;
  setShowHeader: (index: number, show: boolean) => void;
  setShowAllHeaders: (show: boolean) => void;
  moveHeader: (index: number, moveUp: boolean) => void;
  downloadPdf: () => Promise<void>;
}

const usePDFTitleDialogStore = create<DialogStore>((set, get) => ({
  isOpen: false,
  headers: [],
  title: "",
  rows: [],
  showRowNum: false,

  setOpen: (isOpen: boolean) => {
    set({ isOpen });
  },

  setTitle: (title: string) => {
    set({ title });
  },

  setShowHeader: (index: number, show: boolean) => {
    const newHeaders = [...get().headers];

    newHeaders[index].show = show;
    set({ headers: newHeaders });
  },

  setShowAllHeaders: (show: boolean) => {
    set({
      headers: get().headers.map((header) => {
        return { name: header.name, show };
      }),
    });
  },

  moveHeader: (index: number, moveUp: boolean) => {
    const newHeaders = [...get().headers];

    if (
      (index === 0 && moveUp) ||
      (index >= newHeaders.length - 1 && !moveUp)
    ) {
      // Bad index so we will just return
      return;
    }

    newHeaders[index] = newHeaders.splice(
      moveUp ? index - 1 : index + 1,
      1,
      newHeaders[index],
    )[0];

    set({ headers: newHeaders });
  },

  setHeadersAndRows: (
    headerNames: string[],
    rows: string[][],
    showRowNum: boolean,
  ) => {
    set({
      headers: headerNames.map((name) => {
        return { name, show: true };
      }),
      rows,
      showRowNum,
    });
  },

  downloadPdf: async (): Promise<void> => {
    const { title, rows, headers, showRowNum } = get();
    let exportColumns: string[] = headers
      .filter((header) => header.show)
      .map((header) => header.name);
    let exportRows: string[][] = rows.map((row) => {
      return row.filter((colData, index) => headers[index].show);
    });

    // Sort based on the first column
    exportRows.sort((a, b) =>
      a[0].toLowerCase().localeCompare(b[0].toLowerCase()),
    );

    if (showRowNum) {
      exportColumns = ["Count", ...exportColumns];
      exportRows = exportRows.map((row, index) => [index + 1 + "", ...row]);
    }

    exportToPdf(title, exportColumns, exportRows);
  },
}));

export default usePDFTitleDialogStore;
