import { Box, Button, Typography } from "@mui/material";
import useRootTemplateStore from "../../../../stores/useRootTemplateStore.js";
import Conditional from "../../../common/Conditional.js";
import EditItem from "./EditItem.js";
import TemplateTree from "./TemplateTree.js";

const EditTemplate = () => {
  const selectedItemStore = useRootTemplateStore((state) => state.selectedItem);
  const closeEdit = useRootTemplateStore((state) => state.closeEdit);
  const setPreviewOpen = useRootTemplateStore((state) => state.setPreviewOpen);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "98%",
        height: "98%",
        flexGrow: 1,
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "98%",
          height: "98%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "30px",
            width: "100%",
          }}
        >
          <Typography fontWeight="bold">
            This template tree can be used to create a mailchimp conditional
            template.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
            }}
          >
            <TemplateTree />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Conditional condition={selectedItemStore !== null}>
              <EditItem itemStore={selectedItemStore} />
            </Conditional>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "end",
          width: "100%",
          gap: "5px",
        }}
      >
        <Button
          variant="contained"
          autoFocus
          onClick={() => setPreviewOpen(true)}
        >
          Preview
        </Button>
        <Button variant="contained" autoFocus onClick={() => closeEdit(false)}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => closeEdit(true)}>
          Ok
        </Button>
      </Box>
    </Box>
  );
};

export default EditTemplate;
