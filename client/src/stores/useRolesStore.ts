import { create } from "zustand";
import Server from "../server/server.js";

interface Roles {
  availableRoles: string[];

  loadRoles: () => void;
}

const useRolesStore = create<Roles>((set, get) => ({
  availableRoles: [],

  loadRoles: async () => {
    const availableRoles: string[] = await Server.getRoles();

    set({ availableRoles });
  },
}));

export default useRolesStore;
