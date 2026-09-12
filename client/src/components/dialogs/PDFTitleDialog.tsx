import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import {
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useCallback, useMemo } from "react";
import usePDFTitleDialogStore from "../../stores/usePDFTitleDialogStore.js";

const PDFTitleDialog = () => {
  const isOpen = usePDFTitleDialogStore((state) => state.isOpen);
  const setOpen = usePDFTitleDialogStore((state) => state.setOpen);
  const donwloadPDF = usePDFTitleDialogStore((state) => state.downloadPdf);
  const title = usePDFTitleDialogStore((state) => state.title);
  const setTitle = usePDFTitleDialogStore((state) => state.setTitle);
  const headers = usePDFTitleDialogStore((state) => state.headers);
  const setShowHeader = usePDFTitleDialogStore((state) => state.setShowHeader);
  const setShowAllHeaders = usePDFTitleDialogStore(
    (state) => state.setShowAllHeaders,
  );
  const moveHeader = usePDFTitleDialogStore((state) => state.moveHeader);
  const closeDialog = useCallback((ok: boolean) => {
    if (ok) {
      donwloadPDF();
    }

    setOpen(false);
  }, []);
  const selectionState: "all" | "some" | "none" = useMemo(() => {
    let count = 0;

    headers.forEach((header) => {
      if (header.show) {
        count++;
      }
    });

    return count === 0 ? "none" : count === headers.length ? "all" : "some";
  }, [headers]);
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowAllHeaders(event.target.checked);
  };

  return (
    <Dialog open={isOpen} onClose={() => closeDialog(false)}>
      <DialogTitle> Download PDF file</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Select the title for this PDF file. As well, select the column data
          that you would like shown in this file.
        </DialogContentText>
        <TextField
          label="PDF report title"
          name="title"
          required={true}
          value={title}
          onChange={(event: any) => {
            setTitle(event.target.value);
          }}
          fullWidth
          margin="normal"
        />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow style={{ backgroundColor: "darkgray" }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selectionState === "some"}
                    checked={selectionState === "all"}
                    onChange={handleSelectAllClick}
                    inputProps={{ "aria-label": "Select all" }}
                  />
                </TableCell>
                <TableCell>Column name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {headers.map((header, index) => {
                const isItemSelected = header.show;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={"Header" + index}
                    selected={isItemSelected}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell
                      padding="checkbox"
                      onClick={() => setShowHeader(index, !isItemSelected)}
                    >
                      <Checkbox color="primary" checked={isItemSelected} />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {header.name}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Move header up">
                        <IconButton
                          disabled={index === 0}
                          onClick={() => {
                            moveHeader(index, true);
                          }}
                        >
                          <ArrowUpward />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Move header down">
                        <IconButton
                          disabled={index === headers.length - 1}
                          onClick={() => {
                            moveHeader(index, false);
                          }}
                        >
                          <ArrowDownward />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => closeDialog(false)}>Cancel</Button>
        <Button onClick={() => closeDialog(true)}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PDFTitleDialog;
