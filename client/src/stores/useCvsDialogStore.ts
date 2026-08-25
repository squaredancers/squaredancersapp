import { create } from "zustand";
import { RegistrantServerTypeClass } from "../components/main/pages/registrants/RegistrantServerTypeClass.js";

interface DialogStore {
  open: boolean;
  callAfterSave: () => Promise<void>;

  setCallAfterSave: (callAfterSave: () => Promise<void>) => void;

  setOpen: (open: boolean) => void;
  setFileContent: (content: string) => Promise<void>;
}

const useCsvDialogStore = create<DialogStore>((set, get) => ({
  open: false,
  callAfterSave: async () => {},

  setCallAfterSave: (callAfterSave: () => Promise<void>) => {
    set({ callAfterSave });
  },

  setOpen: (open: boolean) => {
    set({ open });
  },

  setFileContent: async (content: string) => {
    const splitContent = content.split("\n");
    const registrantServer = new RegistrantServerTypeClass();
    const bulkResponse =
      await registrantServer.bulkAddRegistrants(splitContent);

    await get().callAfterSave();

    console.log("Bulk add response=", bulkResponse);
  },
}));

export default useCsvDialogStore;
