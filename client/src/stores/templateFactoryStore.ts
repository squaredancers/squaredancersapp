import { create, StoreApi, UseBoundStore } from "zustand";

export enum NodeType {
  TemplateRoot = "templateroot",
  VariableRoot = "variableroot",
  Text = "text",
  Condition = "condition",
  TrueBranch = "truebranch",
  FalseBranch = "falsebranch",
  Variable = "variable",
}

export interface JSONTemplateState {
  name: string;
  nodeType: NodeType;
  fieldName?: string;
  valueName?: string;
  text?: string;
  childItems: JSONTemplateState[];
  variables?: string[];
}

export type TreeItemStore = UseBoundStore<StoreApi<TemplateStoreState>>;

export interface TemplateStoreState {
  parent: TreeItemStore | null;
  id: string;
  nodeType: NodeType;
  count: number;
  name: string;
  fieldName?: string;
  valueName?: string;
  text?: string;
  childItems: TreeItemStore[];
  variables?: string[];

  setName: (name: string) => void;
  setFieldName: (fieldName: string) => void;
  setValueName: (valueName: string) => void;
  setText: (text: string) => void;
  findId: (id: string) => TreeItemStore | null;
  getPreviewText: (nameValue: { [name: string]: string }) => string[];
  getTemplateHtml: () => string[];

  cloneParentChildItems: () => void;
  createItem: (name: string, nodeType: NodeType) => string | null;
  setConditionChildren: (
    trueBranch: TreeItemStore,
    falseBranch: TreeItemStore,
  ) => void;
  moveChild: (id: string, moveUp: boolean) => void;
  deleteItem: () => void;
  deleteChildItem: (id: string) => void;
  loadState: (jsonState: JSONTemplateState) => void;
  getJSONState: () => JSONTemplateState;

  dumpIds: () => void;
}

const templateStoreFactory = (
  parent: TreeItemStore | null,
  id: string,
  nodeType: NodeType,
) => {
  const newStore = create<TemplateStoreState>((set, get) => ({
    parent,
    id,
    nodeType,
    count: 0,
    name: "",
    fieldName: "",
    text: "",
    childItems: [],

    setName: (name: string) => {
      set({ name });
      get().cloneParentChildItems();
    },

    setFieldName: (fieldName: string) => {
      set({ fieldName });
      get().cloneParentChildItems();
    },

    setValueName: (valueName: string) => {
      set({ valueName });
      get().cloneParentChildItems();
    },

    setText: (text: string) => {
      set({ text });
      get().cloneParentChildItems();
    },

    findId: (id: string): TreeItemStore | null => {
      let result: TreeItemStore | null = null;
      const thisId = get().id;

      if (thisId === id) {
        result = newStore;
      } else {
        // Search the children
        const childItems = get().childItems;

        for (let index = 0; index < childItems.length; index++) {
          result = childItems[index].getState().findId(id);

          if (result !== null) {
            break;
          }
        }
      }

      return result;
    },

    cloneParentChildItems: () => {
      const state = get();

      state.parent?.getState().cloneParentChildItems();

      set({
        childItems: [...state.childItems],
      });
    },

    createItem: (name: string, nodeType: NodeType) => {
      const state = get();
      const parentId = state.id;
      const parentCount = state.count;
      let resultId: string | null = null;

      if (nodeType === NodeType.Text || nodeType === NodeType.Variable) {
        const newTextStore = templateStoreFactory(
          newStore,
          `${parentId}_text${parentCount + 1}`,
          nodeType,
        );

        newTextStore.getState().setName(name + (parentCount + 1));

        set({
          childItems: [...state.childItems, newTextStore],
          count: parentCount + 1,
        });
      } else if (nodeType === NodeType.Condition) {
        const conditionId = `${parentId}_cond${parentCount + 1}`;
        const conditionStore = templateStoreFactory(
          newStore,
          conditionId,
          NodeType.Condition,
        );
        const trueBranchStore = templateStoreFactory(
          newStore,
          `${parentId}_truebr${parentCount + 1}`,
          NodeType.TrueBranch,
        );
        const falseBranchStore = templateStoreFactory(
          newStore,
          `${parentId}_falsebr${parentCount + 1}`,
          NodeType.FalseBranch,
        );
        conditionStore.getState().setName(name + (parentCount + 1));
        trueBranchStore
          .getState()
          .setName(name + (parentCount + 1) + "truebranch");
        falseBranchStore
          .getState()
          .setName(name + (parentCount + 1) + "falsebranch");
        conditionStore
          .getState()
          .setConditionChildren(trueBranchStore, falseBranchStore);

        set({
          childItems: [...state.childItems, conditionStore],
          count: parentCount + 1,
        });
        resultId = conditionId;
      }

      get().cloneParentChildItems();

      return resultId;
    },

    setConditionChildren: (
      trueBranch: TreeItemStore,
      falseBranch: TreeItemStore,
    ) => {
      set({ childItems: [trueBranch, falseBranch] });
    },

    moveChild: (id: string, moveUp: boolean) => {
      const childItems = [...get().childItems];
      const index = childItems.findIndex((child) => child.getState().id === id);

      if (
        index === -1 ||
        (index === 0 && moveUp) ||
        (index >= childItems.length - 1 && !moveUp)
      ) {
        // Bad index so we will just return
        return;
      }

      childItems[index] = childItems.splice(
        moveUp ? index - 1 : index + 1,
        1,
        childItems[index],
      )[0];

      set({ childItems });
      get().cloneParentChildItems();
    },

    deleteItem: () => {
      const parent = get().parent?.getState();

      parent?.deleteChildItem(get().id);
    },

    deleteChildItem: (id: string) => {
      const state = get();
      const childItems = [...state.childItems];
      const childIndexToDelete = childItems.findIndex(
        (item) => item.getState().id === id,
      );

      if (childIndexToDelete !== -1) {
        childItems.splice(childIndexToDelete, 1);
        set({ childItems });

        get().cloneParentChildItems();
      }
    },

    loadState: (jsonState: JSONTemplateState) => {
      const {
        name,
        fieldName,
        valueName,
        text,
        variables,
        childItems: jsonChildItems,
      } = jsonState;
      const childItems: TreeItemStore[] = [];
      const parentId = get().id;
      const nodeType = get().nodeType;

      if (nodeType === NodeType.VariableRoot) {
        const variableCount = variables?.length ?? 0;
        const childVariables: TreeItemStore[] = [];

        if (variableCount > 0) {
          variables?.forEach((variable, index) => {
            const newVariableStore = templateStoreFactory(
              newStore,
              `${parentId}_var${index + 1}`,
              NodeType.Variable,
            );

            newVariableStore.getState().setName(variable);
            childVariables.push(newVariableStore);
          });
        }

        set({
          name: "Variable root",
          childItems: childVariables,
          count: variableCount,
        });
      } else {
        jsonChildItems?.forEach((jsonItem, index) => {
          const newItemStore = templateStoreFactory(
            newStore,
            `${parentId}_item${index + 1}`,
            jsonItem.nodeType,
          );

          newItemStore.getState().loadState(jsonItem);
          childItems.push(newItemStore);
        });

        set({
          name,
          fieldName,
          valueName,
          text,
          childItems,
          count: childItems.length,
        });
      }
    },

    getJSONState: () => {
      const state = get();
      const resultState: JSONTemplateState = {
        name: state.name,
        nodeType: state.nodeType,
        childItems: [],
      };

      switch (state.nodeType) {
        case NodeType.Text: {
          resultState.text = state.text;
          break;
        }

        case NodeType.Condition: {
          resultState.fieldName = state.fieldName;
          resultState.valueName = state.valueName;
          break;
        }
      }

      resultState.childItems = state.childItems.map((childStore) =>
        childStore.getState().getJSONState(),
      );

      return resultState;
    },

    getPreviewText: (nameValues: { [name: string]: string }) => {
      const storeState = get();

      switch (storeState.nodeType) {
        case NodeType.Text:
          return [storeState.text ?? ""];
        case NodeType.Condition: {
          const [trueStore, falseStore] = storeState.childItems;
          const fieldName = storeState.fieldName ?? "";
          const fieldValue = storeState.valueName ?? "";

          if (nameValues[fieldName]) {
            if (nameValues[fieldName] === fieldValue) {
              return trueStore.getState().getPreviewText(nameValues);
            } else {
              return falseStore.getState().getPreviewText(nameValues);
            }
          }
          break;
        }
        case NodeType.TemplateRoot:
        case NodeType.TrueBranch:
        case NodeType.FalseBranch: {
          // Just recurse to the child nodes
          const childText: string[] = [];
          const childStores = storeState.childItems;

          childStores.forEach((childStore) => {
            childText.push(...childStore.getState().getPreviewText(nameValues));
          });

          return childText;
        }
      }

      return [];
    },

    getTemplateHtml: (): string[] => {
      const storeState = get();

      switch (storeState.nodeType) {
        case NodeType.Text:
          return [storeState.text ?? ""];
        case NodeType.Condition: {
          const [trueStore, falseStore] = storeState.childItems;
          const fieldName = storeState.fieldName ?? "";
          const fieldValue = storeState.valueName ?? "";
          const trueText = trueStore.getState().getTemplateHtml();
          const falseText = falseStore.getState().getTemplateHtml();
          const conditionResult: string[] = [
            `*|IF:${fieldName}=${fieldValue}|*`,
          ];

          conditionResult.push(...trueText);
          conditionResult.push(`*|ELSE:|*`);
          conditionResult.push(...falseText);
          conditionResult.push(`*|END:IF|*`);
          return conditionResult;
          break;
        }
        case NodeType.TemplateRoot:
        case NodeType.TrueBranch:
        case NodeType.FalseBranch: {
          // Just recurse to the child nodes
          const childText: string[] = [];
          const childStores = storeState.childItems;

          childStores.forEach((childStore) => {
            childText.push(...childStore.getState().getTemplateHtml());
          });

          return childText;
        }
      }

      return [];
    },

    dumpIds: () => {
      let parent: TreeItemStore | null = get().parent;
      let root = parent;

      while (parent !== null) {
        root = parent;
        parent = parent.getState().parent;
      }

      root?.getState().childItems.forEach((child) => {
        console.log("Found child ", child.getState().id);
        console.log("Parent = root", root == child.getState().parent);
      });
    },
  }));

  return newStore;
};

export default templateStoreFactory;
