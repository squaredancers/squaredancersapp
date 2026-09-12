import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import { useCallback } from "react";
import useBulkUpdateConfDialogStore from "../../stores/useBulkUpdateConfDialog.js";
import useCsvDialogStore from "../../stores/useCvsDialogStore.js";
import ConfirmationDialog from "../common/ConfirmationDialog.js";
import FormColumnMapDialog from "../dialogs/FormColumnMapDialog.js";
import MailchimpDialog from "../dialogs/MailchimpDialog.js";
import PDFTitleDialog from "../dialogs/PDFTitleDialog.js";
import Header from "./Header.js";
import MainGrid from "./MainGrid.js";
import SideMenu from "./SideMenu.js";
import ImportFileDialog from "./pages/common/ImportFileDialog.js";

export default function Dashboard(props: {}) {
  const csvOpenDialog = useCsvDialogStore((state) => state.open);
  const setCsvOpenDialog = useCsvDialogStore((state) => state.setOpen);
  const bulkConfUpdateOpen = useBulkUpdateConfDialogStore(
    (state) => state.open,
  );
  const sendIds = useBulkUpdateConfDialogStore((state) => state.sendIds);
  const setBulkUpdateOpen = useBulkUpdateConfDialogStore(
    (state) => state.setOpen,
  );
  const onBulkConfDialogClose = useCallback(
    async (ok: boolean) => {
      if (ok) {
        await sendIds();
      }
      setBulkUpdateOpen(false);
    },
    [sendIds, setBulkUpdateOpen],
  );

  return (
    <>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
              height: "calc( 100vh - 5px )",
            }}
          >
            <Header />
            <ImportFileDialog
              open={csvOpenDialog}
              onClose={(value) => {
                setCsvOpenDialog(false);
                useCsvDialogStore.getState().setFileContent(value);
              }}
            />
            <FormColumnMapDialog />
            <MailchimpDialog />
            <ConfirmationDialog
              open={bulkConfUpdateOpen}
              closeDialog={onBulkConfDialogClose}
              title="Confirm confirmation sent"
              description="You are about to change all registrants shown in this table so that the confirmation sent is true.  Do you want to proceed?"
            />
            <PDFTitleDialog />
            <MainGrid />
          </Stack>
        </Box>
      </Box>
    </>
  );
}
