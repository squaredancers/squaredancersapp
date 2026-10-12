import { Box, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import * as React from "react";
import useAttendanceDialogStore from "../../stores/useAttendanceDialogStore.js";
import { exportToPdf } from "../main/pages/common/pdfUtils.js";

const getFormattedDate = (date: Date): string => {
  const options = {
    month: "short",
    day: "2-digit",
  } as const;

  return date.toLocaleDateString("en-US", options);
};

const AttendanceSheetDialog = () => {
  const setOpen = useAttendanceDialogStore((state) => state.setOpen);
  const isOpen = useAttendanceDialogStore((state) => state.open);
  const names = useAttendanceDialogStore((state) => state.names);
  const title = useAttendanceDialogStore((state) => state.className);
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [dayCount, setDayCount] = React.useState("");
  const [numError, setNumError] = React.useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const validationError = validateDayCount(dayCount);

    event.preventDefault();

    if (validationError !== "") {
      setNumError(validationError);
      return;
    }

    const count = parseInt(dayCount);
    const dates: string[] = [];
    const date: Date = startDate?.toDate() ?? new Date();

    for (let index = 0; index < count; index++) {
      const currentDate = new Date(date);

      currentDate.setDate(currentDate.getDate() + 7 * index);
      dates.push(getFormattedDate(currentDate));
    }

    const columns = ["Names", ...dates];
    const rows: string[][] = names.map((name) => {
      return [name, ...dates.map((date) => "")];
    });

    // Sort the class list based on the first name
    rows.sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()));

    exportToPdf(title, columns, rows, false, true);
    setOpen(false);
  };

  const validateDayCount = (value: string) => {
    if (!value || value === "") {
      return "Day count required.";
    }
    const count = parseInt(value);

    if (Number.isNaN(count) || count < 1 || count > 12) {
      return "Please enter a number between 1 and 12";
    }

    return ""; // No error
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDayCount(value);

    // Clear error dynamically as the user types if it becomes valid
    if (numError) {
      setNumError(validateDayCount(value));
    }
  };

  const handleBlur = () => {
    // Validate when user clicks away from the field
    setNumError(validateDayCount(dayCount + ""));
  };

  return (
    <Dialog open={isOpen} onClose={() => setOpen(false)}>
      <DialogTitle>Attendance sheet</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Set the start date for the attendance sheet and the number of days.
        </DialogContentText>
        <form onSubmit={handleSubmit} id="dialogform">
          <Box sx={{ diplay: "flex", gap: "20px" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start date for attendance sheet"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue!)}
                slotProps={{
                  textField: {
                    sx: { width: "100%", marginBottom: "10px" }, // Force full parent width
                  },
                }}
              />
            </LocalizationProvider>

            <TextField
              label="Day count"
              variant="outlined"
              value={dayCount}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(numError)} // Highlights the field in red if true
              helperText={numError} // Displays the error text below the field
              fullWidth
            />
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit" form="dialogform" disabled={Boolean(numError)}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceSheetDialog;
