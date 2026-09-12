import { create } from "zustand";

interface DialogStore {
  open: boolean;
  content: string;

  setOpen: (open: boolean) => void;
  setFileContent: (content: string) => Promise<void>;
}

const useMailchimpDialogStore = create<DialogStore>((set, get) => ({
  open: false,
  content: "",

  setOpen: (open: boolean) => {
    set({ open });
  },

  setFileContent: async (content: string) => {
    set({ content });
  },
}));

export default useMailchimpDialogStore;
