import { create } from "zustand";
import templateStoreFactory, {
  JSONTemplateState,
  NodeType,
  TreeItemStore,
} from "./templateFactoryStore.js";

interface State {
  templateRoot: TreeItemStore;
  variableRoot: TreeItemStore;
  selectedItem: TreeItemStore | null;
  selectedId: string | null;
  editTemplateName: string | null;
  previewOpen: boolean;
  templateDialogOpen: boolean;
  templateDialogJsonString: string;
  setTemplateDialogOpen: (templateDialogOpen: boolean) => void;
  setTemplateDialogJsonString: (jsonString: string) => void;
  saveData: (name: string, jsonString: string) => void;

  loadState: (
    editProfileName: string,
    jsonState: JSONTemplateState,
    saveData: (name: string, jsonString: string) => void,
  ) => void;
  closeEdit: (save: boolean) => void;
  setPreviewOpen: (previewOpen: boolean) => void;
  setSelectedItem: (id: string | null) => void;
}

const useRootTemplateStore = create<State>((set, get) => ({
  templateRoot: templateStoreFactory(null, "tempdummy", NodeType.TemplateRoot),
  variableRoot: templateStoreFactory(null, "vardummy", NodeType.VariableRoot),
  selectedItem: null,
  selectedId: null,
  editTemplateName: null,
  previewOpen: false,
  templateDialogOpen: false,
  templateDialogJsonString: "{}",
  saveData: () => {},

  loadState: (
    editTemplateName: string,
    jsonState: JSONTemplateState,
    saveData: (name: string, jsonString: string) => void,
  ) => {
    const templateRoot = templateStoreFactory(
      null,
      "TemplateRoot",
      NodeType.TemplateRoot,
    );
    const variableRoot = templateStoreFactory(
      null,
      "VariableRoot",
      NodeType.VariableRoot,
    );

    templateRoot.getState().loadState(jsonState);
    templateRoot.getState().setName(editTemplateName);

    variableRoot.getState().loadState(jsonState);

    set({
      editTemplateName,
      previewOpen: false,
      templateRoot,
      variableRoot,
      selectedId: null,
      selectedItem: null,
      saveData,
    });
  },

  closeEdit: (save: boolean) => {
    if (save) {
      const state = get();
      const rootJSON = state.templateRoot.getState().getJSONState();
      const variables = state.variableRoot
        .getState()
        .childItems.map((varStore) => varStore.getState().name);
      rootJSON.variables = variables;
      state.saveData(rootJSON.name, JSON.stringify(rootJSON));
    }

    set({ editTemplateName: null, previewOpen: false });
  },

  setPreviewOpen: (previewOpen: boolean) => {
    set({ previewOpen });
  },

  setSelectedItem: (id: string | null) => {
    const state = get();
    let storeItemFound: TreeItemStore | null = null;

    if (id !== null) {
      storeItemFound = state.templateRoot?.getState().findId(id) ?? null;

      storeItemFound =
        storeItemFound !== null
          ? storeItemFound
          : (state.variableRoot?.getState().findId(id) ?? null);
    }

    set({ selectedItem: storeItemFound, selectedId: id });
  },

  setTemplateDialogOpen: (templateDialogOpen: boolean) => {
    set({ templateDialogOpen });
  },

  setTemplateDialogJsonString: (jsonString: string) => {
    set({ templateDialogJsonString: jsonString });
  },
}));

export default useRootTemplateStore;
