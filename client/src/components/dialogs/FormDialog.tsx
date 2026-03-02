import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useFormDialogStore, {
  TypeInfo,
} from "../../stores/useFormDialogStore.js";

const FormDialog = () => {
  const dialogData = useFormDialogStore((state) => state.dialogData);
  const closeDialog = useFormDialogStore((state) => state.closeDialog);
  const updateField = useFormDialogStore((state) => state.updateField);
  const isOpen = useFormDialogStore((state) => state.isOpen);
  const validationErrors = useFormDialogStore(
    (state) => state.validationErrors
  );
  const hasValidationErrors = Object.keys(validationErrors).length !== 0;
  const title = useFormDialogStore((state) => state.title);
  const contentText = useFormDialogStore((state) => state.contentText);
  const submitText = useFormDialogStore((state) => state.submitText);
  const hasStateChanged = React.useMemo(() => {
    const dialogState = useFormDialogStore.getState();

    return dialogState.hasChanged();
  }, [dialogData]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const dialogState = useFormDialogStore.getState();

    event.preventDefault();
    dialogState.saveData(dialogState.dialogData);
    dialogState.closeDialog();
  };

  console.log("In use form dialog.  Open = ", isOpen);
  return (
    <Dialog open={isOpen} onClose={closeDialog}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{contentText}</DialogContentText>
        <form onSubmit={handleSubmit} id="dialogform">
          {dialogData.map((entry, mapIndex) => {
            const validationError = validationErrors[entry.fieldName];

            if (entry.type === TypeInfo.String) {
              return (
                <TextField
                  error={validationError !== undefined}
                  helperText={validationError}
                  autoFocus={mapIndex === 0 ? true : undefined}
                  required
                  margin="dense"
                  id={entry.fieldName}
                  name={entry.fieldName}
                  label={entry.fieldName}
                  type="text"
                  value={entry.newValue as string}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    updateField(entry.fieldName, event.target.value);
                  }}
                  fullWidth
                  variant="standard"
                />
              );
            } else {
              return (
                <Checkbox
                  checked={entry.newValue === "true"}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    updateField(
                      entry.fieldName,
                      event.target.checked ? "true" : "false"
                    );
                  }}
                />
              );
            }
          })}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Cancel</Button>
        <Button
          type="submit"
          form="dialogform"
          disabled={!hasStateChanged || hasValidationErrors}
        >
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;
