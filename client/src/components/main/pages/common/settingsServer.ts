import useSettingsStore from "../../../../stores/useSettingsStore.js";
import BaseServer from "./baseServer.js";
import IDField from "./types.js";

export interface SettingsServerType extends IDField {}

export interface SettingsTableType extends IDField {
  name: string;
  jsonString: string;
}

export class SettingsServerTypeClass<
  TableType extends SettingsTableType,
  ServerType extends SettingsServerType,
> extends BaseServer<TableType, ServerType> {
  settingName: string;

  public constructor(settingName: string) {
    super("");
    this.settingName = settingName;
  }

  public mapTableToServer(settings: TableType): ServerType {
    return { id: 0 } as ServerType;
  }

  public mapServerToTable(settings: ServerType): TableType {
    return { id: 0 } as TableType;
  }

  public async getRow(id: number): Promise<TableType | null> {
    // getRow not supported.
    return null;
  }

  public async getRows(): Promise<TableType[]> {
    const settings = useSettingsStore.getState().settings;
    const jsonString = settings[this.settingName] ?? "[]";
    const settingsArray = JSON.parse(jsonString) as {
      name: string;
      jsonString: string;
    }[];
    const newSetingsArray = settingsArray.map((settings, index) => {
      const fields = JSON.parse(settings.jsonString) as {
        [key: string]: string | number | boolean;
      };

      return { ...settings, id: index, ...fields };
    });

    return newSetingsArray as TableType[];
  }

  public async createRow(row: TableType): Promise<void> {
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

  public async moveRow(row: TableType, moveUp: boolean) {
    const settings = useSettingsStore.getState().settings;
    const updateSetting = useSettingsStore.getState().updateSetting;
    const jsonString = settings[this.settingName] ?? "[]";
    const settingsArray = JSON.parse(jsonString) as {
      name: string;
      jsonString: string;
    }[];

    const settingsIndex = row.id;

    if (
      (settingsIndex === 0 && moveUp) ||
      (settingsIndex >= settingsArray.length - 1 && !moveUp)
    ) {
      // Bad index so we will just return
      return;
    }

    settingsArray[settingsIndex] = settingsArray.splice(
      moveUp ? settingsIndex - 1 : settingsIndex + 1,
      1,
      settingsArray[settingsIndex],
    )[0];

    return await updateSetting(this.settingName, JSON.stringify(settingsArray));
  }

  public async updateRow(row: TableType): Promise<void> {
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

  public async deleteRow(row: TableType): Promise<void> {
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
