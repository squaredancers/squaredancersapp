import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

function ConfirmationDialog(props: {
  open: boolean;
  closeDialog: (okPressed: boolean) => void;
  title: string;
  description: string;
}) {
  const handleCancel = () => {
    props.closeDialog(false);
  };

  const handleOk = () => {
    props.closeDialog(true);
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={props.open}
    >
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>{props.description}</DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleOk}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;
