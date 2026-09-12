import { create } from "zustand";

interface UserInfo {
  firstname: string;
  lastname: string;
  email: string;
  token: string;
  roles: string[];

  login: (
    firstname: string,
    lastname: string,
    email: string,
    token: string,
    roles: string[],
  ) => void;

  logout: () => void;

  setToken: (token: string) => void;
}

const useUserStore = create<UserInfo>((set, get) => ({
  firstname: "",
  lastname: "",
  email: "",
  token: "",
  roles: [],

  login: (
    firstname: string,
    lastname: string,
    email: string,
    token: string,
    roles: string[],
  ) => {
    set({ firstname, lastname, email, token, roles });
  },

  setToken: (token: string) => {
    set({ token });
  },

  logout: () => {
    set({ firstname: "", lastname: "", email: "", token: "", roles: [] });
  },
}));

export default useUserStore;
