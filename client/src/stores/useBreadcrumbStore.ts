import { create } from "zustand";

interface State {
  breadcrumbs: string[];

  setBreadcrumbs: (breadcrumbs: string[]) => void;
}

const useBreadcrumbStore = create<State>((set, get) => ({
  breadcrumbs: [],

  setBreadcrumbs: (breadcrumbs: string[]) => {
    set({ breadcrumbs });
  },
}));

export default useBreadcrumbStore;
