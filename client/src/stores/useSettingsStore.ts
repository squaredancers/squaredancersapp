import { create } from "zustand";
import Server from "../server/server.js";

export const MAPPING_SETTINGS: string = "mapping_settings";
export const TEMPLATE_SETTINGS: string = "template_settings";
interface SettingsStore {
  settings: { [key: string]: string };
  loading: boolean;

  updateSetting: (key: string, value: string) => Promise<void>;
  loadSettings: () => void;
}

const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: {},
  loading: false,

  updateSetting: async (key: string, value: string): Promise<void> => {
    const newSettings = { ...get().settings, [key]: value };

    set({ settings: newSettings });

    return await Server.updateSetting(key, value, false);
  },

  loadSettings: async () => {
    const isLoading = get().loading;

    if (!isLoading) {
      set({ loading: true });
      const settings = await Server.getSettings();

      // We need the mappings setting defined
      if (!settings[MAPPING_SETTINGS]) {
        await Server.updateSetting(MAPPING_SETTINGS, "[]", true);
        settings[MAPPING_SETTINGS] = "[]";
      }

      if (!settings[TEMPLATE_SETTINGS]) {
        await Server.updateSetting(TEMPLATE_SETTINGS, "[]", true);
        settings[TEMPLATE_SETTINGS] = "[]";
      }
      set({ settings, loading: false });
    }
  },
}));

export default useSettingsStore;
