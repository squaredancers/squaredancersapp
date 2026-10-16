import { create } from "zustand";

interface AttendanceStore {
  open: boolean;
  names: string[][];
  className: string;

  setOpen: (open: boolean) => void;
  setNames: (names: string[][], className: string) => void;
}

const useAttendanceDialogStore = create<AttendanceStore>((set, get) => ({
  open: false,
  names: [],
  className: "",

  setOpen: (open: boolean) => {
    set({ open });
  },

  setNames: (names: string[][], className: string) => {
    set({ names, className });
  },
}));

export default useAttendanceDialogStore;
