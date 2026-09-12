import { ArrowDownward, ArrowUpward, Delete } from "@mui/icons-material";
import {
  IconButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TableCell,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Tooltip from "@mui/material/Tooltip";
import useFormColumnMapDialogStore, {
  fields as allFields,
} from "../../stores/useFormColumnMapDialogStore.js";

const FormColumnMapDialog = () => {
  const isOpen = useFormColumnMapDialogStore((state) => state.isOpen);
  const closeDialog = useFormColumnMapDialogStore((state) => state.closeDialog);
  const addField = useFormColumnMapDialogStore((state) => state.addMapping);
  const updateFields = useFormColumnMapDialogStore(
    (state) => state.updateMapping,
  );
  const fields = useFormColumnMapDialogStore((state) => state.fields);
  const moveMapping = useFormColumnMapDialogStore((state) => state.moveMapping);
  const deleteMapping = useFormColumnMapDialogStore(
    (state) => state.deleteMapping,
  );

  const noMapping = allFields[0];

  return (
    <Dialog open={isOpen} onClose={() => closeDialog(false)}>
      <DialogTitle> Assign google form fields.</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This dialog allows you to assign data fields to columns in a google
          form csv file. If the user is new the first name, last name, email,
          and phone fields will be used to create a new user in the database.
        </DialogContentText>
        <form id="dialogform">
          <Stack
            spacing={2}
            sx={{
              mx: 3,
            }}
          >
            <Button onClick={() => addField(noMapping)}>Add column</Button>
            <table
              style={{
                borderCollapse: "collapse",
                border: "1px solid #cccccc",
              }}
            >
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field + index + "row"}>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid #cccccc", padding: 1 }}
                    >
                      {index + 1}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ border: "1px solid #cccccc", padding: 1 }}
                    >
                      <Select
                        multiple={false}
                        value={field}
                        labelId="location-label"
                        onChange={(event) => {
                          const fieldId = event.target.value;

                          updateFields(index, fieldId);
                        }}
                      >
                        {allFields.map((field, index) => {
                          return (
                            <MenuItem key={field + index} value={field}>
                              <ListItemText primary={field} />
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Move mapping up">
                        <IconButton
                          disabled={index === 0}
                          onClick={() => {
                            moveMapping(index, true);
                          }}
                        >
                          <ArrowUpward />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Move mapping down">
                        <IconButton
                          disabled={index === fields.length - 1}
                          onClick={() => {
                            moveMapping(index, false);
                          }}
                        >
                          <ArrowDownward />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete mapping">
                        <IconButton
                          onClick={() => {
                            deleteMapping(index);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => closeDialog(false)}>Cancel</Button>
        <Button onClick={() => closeDialog(true)} form="dialogform">
          Update columns
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormColumnMapDialog;
