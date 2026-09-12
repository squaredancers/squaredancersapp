import { create } from "zustand";
import useUserStore from "./useUserStore.js";

interface FlagState {
  setFlags: () => void;
}

const useFlagStore = create<FlagState>((set, get) => ({
  setFlags: () => {
    const urlParams = new URLSearchParams(window.location.search);
    const setToken = useUserStore.getState().setToken;
    const token = urlParams.get("token");

    setToken(token ?? "");
  },
}));

export default useFlagStore;
