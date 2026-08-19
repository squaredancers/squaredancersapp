import { Button, DialogActions, DialogContent } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";

export interface SimpleDialogProps {
  open: boolean;
  onClose: (value: string) => void;
}

const ImportFileDialog = (props: SimpleDialogProps) => {
  const { onClose, open } = props;
  const [fileContent, setFileContent] = useState("");

  const handleClose = () => {
    onClose("");
  };

  const readFileAsync = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) =>
        resolve((event?.target?.result as string) ?? "");
      reader.onerror = (error) => reject(error);

      reader.readAsText(file);
    });
  };

  const handleSetFileContent = async (file: File | undefined) => {
    if (!file) {
      return; // Exit if no file was selected
    }

    const content = await readFileAsync(file);

    //console.log("Setting content to ", content);
    setFileContent(content);
  };

  const handleConfirm = (fileContent: string) => {
    onClose(fileContent);
  };

  return (
    <Dialog open={props.open} sx={{ m: 2 }} maxWidth="md" fullWidth>
      <DialogTitle>Select a CSV file to import.</DialogTitle>

      <DialogContent>
        <input
          type="file"
          accept=".csv"
          width="200"
          onChange={(evt) => {
            const fileList = evt.target.files;

            handleSetFileContent(fileList?.[0]);
          }}
        />
      </DialogContent>

      <DialogActions>
        {/* Cancel Button */}
        <Button onClick={() => handleClose()} color="primary">
          Cancel
        </Button>

        {/* OK/Confirm Button */}
        <Button
          onClick={() => handleConfirm(fileContent)}
          color="primary"
          autoFocus
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportFileDialog;
