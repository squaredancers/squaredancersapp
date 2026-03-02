import { create } from "zustand";

export enum Pages {
  Home = "Home",
  Events = "Events",
  Users = "Users",
  Locations = "Locations",
  ClassInfo = "ClassInfo",
  Classes = "Classes",
  Callers = "Callers",
}

interface PageInfo {
  page: Pages;

  setPage: (page: Pages) => void;
}

const usePageStore = create<PageInfo>((set, get) => ({
  page: Pages.Home,

  setPage: (page: Pages) => {
    set({ page });
  },
}));

export default usePageStore;
