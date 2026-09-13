import { create } from "zustand";

interface State {
  open: boolean;
  message: string;

  setOpen: (open: boolean) => void;
  setMessage: (message: string, timeout?: number) => void;
}

const useNotificationMessageStore = create<State>((set, get) => ({
  open: false,
  message: "",

  setOpen: (open: boolean) => {
    set({ open });
  },

  setMessage: (message: string, timeout?: number) => {
    if (timeout) {
      setTimeout(() => {
        get().setOpen(false);
      }, timeout);
    }

    set({ message, open: true });
  },
}));

export default useNotificationMessageStore;
