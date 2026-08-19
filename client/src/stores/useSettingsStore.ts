import { create } from "zustand";
import Server from "../server/server.js";

export const MAPPING_SETTINGS: string = "mapping_settings";

interface SettingsStore {
  settings: { [key: string]: string };
  loading: boolean;

  updateSetting: (key: string, value: string) => void;
  loadSettings: () => void;
}

const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: {},
  loading: false,

  updateSetting: async (key: string, value: string) => {
    const newSettings = { ...get().settings, [key]: value };

    set({ settings: newSettings });
    await Server.updateSetting(MAPPING_SETTINGS, value, false);
  },

  loadSettings: async () => {
    const isLoading = get().loading;

    console.log("IN loading settings:", isLoading);
    if (!isLoading) {
      console.log("Calling server to get the settings");

      set({ loading: true });
      const settings = await Server.getSettings();

      // We need the mappings setting defined
      if (!settings[MAPPING_SETTINGS]) {
        await Server.updateSetting(MAPPING_SETTINGS, "[]", true);
        settings[MAPPING_SETTINGS] = "[]";
      }

      set({ settings, loading: false });
    }
  },
}));

export default useSettingsStore;
