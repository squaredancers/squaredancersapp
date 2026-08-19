import { create } from "zustand";
import useSettingsStore, { MAPPING_SETTINGS } from "./useSettingsStore.js";

export const fields = [
  "NoMapping",
  "Firstname",
  "Lastname",
  "Email",
  "Phone",
  "PaySession",
  "PayPerClass",
  "Timestamp",
  "PaymentType",
  "RegistrationType",
  "Class",
] as const;

type FieldType = (typeof fields)[number];

interface DialogStore {
  isOpen: boolean;
  fields: FieldType[];

  openDialog: () => void;

  addMapping: (field: FieldType) => void;

  deleteMapping: (index: number) => void;

  moveMapping: (index: number, moveUp: boolean) => void;

  updateMapping: (index: number, field: FieldType) => void;

  closeDialog: (saveData: boolean) => void;
}

const useFormColumnMapDialogStore = create<DialogStore>((set, get) => ({
  isOpen: false,
  fields: [],

  openDialog: () => {
    const columnMappingsString =
      useSettingsStore.getState().settings[MAPPING_SETTINGS];

    console.log("Colum mappings=", columnMappingsString);
    const columnMappings = JSON.parse(columnMappingsString) as FieldType[];

    set({ isOpen: true, fields: columnMappings });
  },

  addMapping: (field: FieldType) => {
    const newFields = [...get().fields, field];

    set({ fields: newFields });
  },

  deleteMapping: (index: number) => {
    const newFields = [...get().fields];

    newFields.splice(index, 1);

    set({ fields: newFields });
  },

  moveMapping: (index: number, moveUp: boolean) => {
    const newFields = [...get().fields];

    if ((index === 0 && moveUp) || (index >= newFields.length - 1 && !moveUp)) {
      // Bad index so we will just return
      return;
    }

    newFields[index] = newFields.splice(
      moveUp ? index - 1 : index + 1,
      1,
      newFields[index],
    )[0];

    set({ fields: newFields });
  },

  updateMapping: (index: number, field: FieldType) => {
    const newFields = [...get().fields];

    newFields[index] = field;

    set({ fields: newFields });
  },

  closeDialog: (saveData: boolean) => {
    if (saveData) {
      const updatedFields = JSON.stringify(get().fields);

      useSettingsStore
        .getState()
        .updateSetting(MAPPING_SETTINGS, updatedFields);
    }

    set({ isOpen: false, fields: [] });
  },
}));

export default useFormColumnMapDialogStore;
