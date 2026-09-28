import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import ConditionIcon from "@mui/icons-material/Merge";
import VariableIcon from "@mui/icons-material/QuestionMark";
import TextIcon from "@mui/icons-material/Subject";
import RootIcon from "@mui/icons-material/Summarize";

import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import {
  NodeType,
  TreeItemStore,
} from "../../../../stores/templateFactoryStore.js";
import Conditional from "../../../common/Conditional.js";

const renderLabel = (
  store: TreeItemStore,
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>,
) => {
  const useStore = store;
  const id = useStore((state) => state.id);
  const nodeType = useStore((state) => state.nodeType);
  const hasAddIcons =
    nodeType === NodeType.TemplateRoot ||
    nodeType === NodeType.TrueBranch ||
    nodeType === NodeType.FalseBranch;
  const hasDeleteIcon =
    nodeType === NodeType.Text ||
    nodeType === NodeType.Condition ||
    nodeType === NodeType.Variable;
  let name = useStore((state) => state.name);
  const variable = useStore((state) => state.fieldName);
  const value = useStore((state) => state.valueName);

  name = variable && value ? `${name}: ${variable} = ${value}` : name;
  const createNode = useStore((state) => state.createItem);
  const deleteNode = useStore((state) => state.deleteItem);
  const updateParent = (childId: string | null) => {
    return (prevExpanded: string[]) => {
      let expandedList = prevExpanded.includes(id)
        ? prevExpanded
        : [...prevExpanded, id];
      expandedList =
        childId === null || expandedList.includes(childId ?? "")
          ? expandedList
          : [...expandedList, childId];

      return expandedList;
    };
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        pr: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
        }}
      >
        <Conditional condition={nodeType === NodeType.TemplateRoot}>
          <RootIcon fontSize="small" />
        </Conditional>
        <Conditional
          condition={
            nodeType === NodeType.VariableRoot || nodeType === NodeType.Variable
          }
        >
          <VariableIcon fontSize="small" />
        </Conditional>
        <Conditional condition={nodeType === NodeType.Text}>
          <TextIcon fontSize="small" />
        </Conditional>
        <Conditional condition={nodeType === NodeType.Condition}>
          <ConditionIcon fontSize="small" />
        </Conditional>
        <Conditional condition={nodeType === NodeType.TrueBranch}>
          <CheckIcon fontSize="small" />
        </Conditional>
        <Conditional condition={nodeType === NodeType.FalseBranch}>
          <CancelIcon fontSize="small" />
        </Conditional>
        <Typography variant="body2">{name}</Typography>
      </Box>

      <Box className="tree-actions" sx={{ display: "flex", gap: 0.5 }}>
        <Conditional condition={hasAddIcons}>
          <Tooltip title="Add text">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                createNode("Text", NodeType.Text);

                setExpandedItems(updateParent(null));
              }}
              color="primary"
            >
              <TextIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add condition">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                const childId = createNode("Cond", NodeType.Condition);

                setExpandedItems(updateParent(childId));
              }}
              color="primary"
            >
              <ConditionIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Conditional>
        <Conditional condition={hasDeleteIcon}>
          <Tooltip title="Delete item">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                deleteNode();
              }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Conditional>
        <Conditional condition={nodeType === NodeType.VariableRoot}>
          <Tooltip title="Add variable">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                createNode("Var", NodeType.Variable);
                setExpandedItems(updateParent(null));
              }}
              color="primary"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Conditional>
      </Box>
    </Box>
  );
};

const TemplateTreeItem = (props: {
  store: TreeItemStore;
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const useStore = props.store;
  const childItems = useStore((state) => state.childItems);
  const id = useStore((state) => state.id);

  return (
    <TreeItem
      key={id}
      itemId={id}
      label={renderLabel(useStore, props.setExpandedItems)} // Passing the custom element into the label
    >
      {childItems.map((childStore) => (
        <TemplateTreeItem
          key={childStore.getState().id}
          store={childStore}
          setExpandedItems={props.setExpandedItems}
        />
      ))}
    </TreeItem>
  );
};

export default TemplateTreeItem;
