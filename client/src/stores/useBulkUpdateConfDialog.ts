import { create } from "zustand";
import { RegistrantServerTypeClass } from "../components/main/pages/registrants/RegistrantServerTypeClass.js";

interface DialogStore {
  open: boolean;
  ids: number[];
  callAfterSave: () => Promise<void>;

  setCallAfterSave: (callAfterSave: () => Promise<void>) => void;

  setOpen: (open: boolean) => void;
  setIds: (ids: number[]) => Promise<void>;
  sendIds: () => Promise<void>;
}

const useBulkUpdateConfDialogStore = create<DialogStore>((set, get) => ({
  open: false,
  ids: [],
  callAfterSave: async () => {},

  setCallAfterSave: (callAfterSave: () => Promise<void>) => {
    set({ callAfterSave });
  },

  setOpen: (open: boolean) => {
    set({ open });
  },

  setIds: async (ids: number[]) => {
    set({ ids });
  },

  sendIds: async () => {
    const registrantServer = new RegistrantServerTypeClass();
    const bulkResponse = await registrantServer.bulkUpdateConfSent(get().ids);

    await get().callAfterSave();

    console.log("Bulk update response=", bulkResponse);
  },
}));

export default useBulkUpdateConfDialogStore;
