import { create } from "zustand";

export enum TypeInfo {
  String,
  Boolean,
}

export interface DataTypeInfo {
  fieldName: string;
  oldValue: string;
  newValue: string;
  type: TypeInfo;
  validation?: (value: string) => string | null;
}

interface DialogStore {
  title: string;
  contentText: string;
  submitText: string;
  isOpen: boolean;
  dialogData: DataTypeInfo[];
  validationErrors: { [key: string]: string };

  openDialog: (
    title: string,
    contentText: string,
    submitText: string,
    dialogData: DataTypeInfo[],
    saveData: (data: DataTypeInfo[]) => void
  ) => void;

  closeDialog: () => void;

  updateField: (fieldName: string, newValue: string) => void;

  hasChanged: () => boolean;

  saveData: (data: DataTypeInfo[]) => void;
}

const useFormDialogStore = create<DialogStore>((set, get) => ({
  title: "",
  contentText: "",
  submitText: "",
  isOpen: false,
  validationErrors: {},
  dialogData: [],

  openDialog: (
    title: string,
    contentText: string,
    submitText: string,
    dialogData: DataTypeInfo[],
    saveData: (data: DataTypeInfo[]) => void
  ) => {
    console.log("In open dialog");
    set({ title, contentText, submitText, dialogData, isOpen: true, saveData });
  },

  closeDialog: () => {
    set({ isOpen: false });
  },

  updateField: (fieldName: string, newValue: string) => {
    const state = get();
    const dialogData = state.dialogData;
    const fieldIndex = dialogData.findIndex(
      (field) => field.fieldName === fieldName
    );
    const fieldEntry = fieldIndex === -1 ? undefined : dialogData[fieldIndex];
    const newValidationErrors = { ...state.validationErrors };
    const newDialogData = [...dialogData];

    if (fieldEntry) {
      const newFieldEntry = { ...fieldEntry, newValue };

      newDialogData[fieldIndex] = newFieldEntry;
    }

    if (fieldEntry?.validation) {
      const validationError = fieldEntry.validation(newValue);

      if (validationError === null) {
        delete newValidationErrors[fieldName];
      } else {
        newValidationErrors[fieldName] = validationError;
      }
    }

    set({ validationErrors: newValidationErrors, dialogData: newDialogData });
  },

  hasChanged: () => {
    let changed = false;
    const dialogData = get().dialogData;

    dialogData.forEach((entry) => {
      if (entry.oldValue !== entry.newValue) {
        changed = true;
      }
    });

    return changed;
  },

  saveData: () => {},
}));

export default useFormDialogStore;
