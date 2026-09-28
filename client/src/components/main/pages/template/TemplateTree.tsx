import { Box, Typography } from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view";
import { useState } from "react";
import useRootTemplateStore from "../../../../stores/useRootTemplateStore.js";
import TemplateTreeItem from "./TemplateTreeItem.js";

const TemplateTree = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const templateRoot = useRootTemplateStore((state) => state.templateRoot);
  const variableRoot = useRootTemplateStore((state) => state.variableRoot);
  const selectedId = useRootTemplateStore((state) => state.selectedId);
  const setSelectedId = useRootTemplateStore((state) => state.setSelectedItem);
  const handleExpansionToggle = (event: any, itemIds: string[]) => {
    setExpandedItems(itemIds);
  };

  const handleSelectionChange = (event: any, itemId: string | null) => {
    setSelectedId(itemId);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        maxWidth: 400,
        overflow: "auto",
        maxHeight: "500px",
      }}
    >
      <Typography fontWeight="bold">Template tree</Typography>
      <SimpleTreeView
        expandedItems={expandedItems}
        onExpandedItemsChange={handleExpansionToggle}
        selectedItems={selectedId}
        onSelectedItemsChange={handleSelectionChange}
      >
        <TemplateTreeItem
          store={templateRoot}
          setExpandedItems={setExpandedItems}
        />
        <TemplateTreeItem
          store={variableRoot}
          setExpandedItems={setExpandedItems}
        />
      </SimpleTreeView>
    </Box>
  );
};

export default TemplateTree;
