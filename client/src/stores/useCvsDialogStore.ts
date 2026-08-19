import { create } from "zustand";
import { RegistrantServerTypeClass } from "../components/main/pages/registrants/RegistrantServerTypeClass.js";

interface DialogStore {
  open: boolean;

  setOpen: (open: boolean) => void;
  setFileContent: (content: string) => Promise<void>;
}

const useCsvDialogStore = create<DialogStore>((set, get) => ({
  open: false,

  setOpen: (open: boolean) => {
    set({ open });
  },

  setFileContent: async (content: string) => {
    const splitContent = content.split("\n");
    const registrantServer = new RegistrantServerTypeClass();
    const bulkResponse =
      await registrantServer.bulkAddRegistrants(splitContent);

    console.log("Bulk add response=", bulkResponse);
  },
}));

export default useCsvDialogStore;
