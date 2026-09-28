import useSettingsStore from "../../../../stores/useSettingsStore.js";
import BaseServer from "./baseServer.js";

export interface SettingsServerType {
  id: number;
}

export interface SettingsTableType {
  id: number;
  name: string;
  jsonString: string;
}

export class SettingsServerTypeClass extends BaseServer<
  SettingsTableType,
  SettingsServerType
> {
  settingName: string;

  public constructor(settingName: string) {
    super("");
    this.settingName = settingName;
  }

  public mapTableToServer(settings: SettingsTableType): SettingsServerType {
    return { id: 0 };
  }

  public mapServerToTable(settings: SettingsServerType): SettingsTableType {
    return { id: 0 } as SettingsTableType;
  }

  public async getRow(id: number): Promise<SettingsTableType | null> {
    // getRow not supported.
    return null;
  }

  public async getRows(): Promise<SettingsTableType[]> {
    const settings = useSettingsStore.getState().settings;
    const jsonString = settings[this.settingName] ?? "[]";
    const settingsArray = JSON.parse(jsonString) as {
      name: string;
      jsonString: string;
    }[];
    const newSetingsArray = settingsArray.map((settings, index) => {
      return { ...settings, id: index };
    });

    console.log("Get rows=", newSetingsArray);
    return newSetingsArray;
  }

  public async createRow(row: SettingsTableType): Promise<void> {
    console.log("Create a new template");
    const settings = useSettingsStore.getState().settings;
    const updateSetting = useSettingsStore.getState().updateSetting;
    const jsonString = settings[this.settingName] ?? "[]";
    const settingsArray = JSON.parse(jsonString) as {
      name: string;
      jsonString: string;
    }[];
    const updatedSetting = [
      ...settingsArray,
      { name: row.name, jsonString: row.jsonString },
    ];

    return await updateSetting(
      this.settingName,
      JSON.stringify(updatedSetting),
    );
  }

  public async updateRow(row: SettingsTableType): Promise<void> {
    const settings = useSettingsStore.getState().settings;
    const updateSetting = useSettingsStore.getState().updateSetting;
    const jsonString = settings[this.settingName] ?? "[]";
    const settingsArray = JSON.parse(jsonString) as {
      name: string;
      jsonString: string;
    }[];
    const settingsIndex = row.id;
    settingsArray.splice(settingsIndex, 1, {
      name: row.name,
      jsonString: row.jsonString,
    });

    return await updateSetting(this.settingName, JSON.stringify(settingsArray));
  }

  public async deleteRow(row: SettingsTableType): Promise<void> {
    const settings = useSettingsStore.getState().settings;
    const updateSetting = useSettingsStore.getState().updateSetting;
    const jsonString = settings[this.settingName] ?? "[]";
    const settingsArray = JSON.parse(jsonString) as {
      name: string;
      jsonString: string;
    }[];
    const settingsIndex = row.id;
    settingsArray.splice(settingsIndex, 1);

    return await updateSetting(this.settingName, JSON.stringify(settingsArray));
  }
}
