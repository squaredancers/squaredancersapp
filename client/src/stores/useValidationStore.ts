import { create } from "zustand";

interface ValidationState {
  validationErrors: Record<string, string | undefined>;

  setValidationErrors: (
    validationErrors: Record<string, string | undefined>,
  ) => void;
}

const useValidationStore = create<ValidationState>((set, get) => ({
  validationErrors: {},

  setValidationErrors: (
    validationErrors: Record<string, string | undefined>,
  ) => {
    set({ validationErrors });
  },
}));

export default useValidationStore;
