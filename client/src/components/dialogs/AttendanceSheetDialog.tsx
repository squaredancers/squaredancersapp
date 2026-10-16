import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import * as React from "react";
import useAttendanceDialogStore from "../../stores/useAttendanceDialogStore.js";
import Conditional from "../common/Conditional.js";
import { exportToPdf } from "../main/pages/common/pdfUtils.js";

const getFormattedDate = (date: Date): string => {
  const options = {
    month: "short",
    day: "2-digit",
  } as const;

  return date.toLocaleDateString("en-US", options);
};

const datesCompare = (date1: Date, date2: Date): number => {
  const date1Copy = new Date(date1);
  const date2Copy = new Date(date2);

  date1Copy.setHours(0, 0, 0, 0);
  date2Copy.setHours(0, 0, 0, 0);

  const date1Time = date1Copy.getTime();
  const date2Time = date2Copy.getTime();

  console.log("date1 time=", date1Time, "date2Time=", date2Time);
  return date1Time === date2Time ? 0 : date1Time > date2Time ? 1 : -1;
};

const isDateInArray = (date: Date, days: Dayjs[]) => {
  return days.some((day) => {
    const result = datesCompare(day.toDate(), date);
    console.log("date1=", day.toDate(), "date2=", date, "result=", result);
    return result === 0;
  });
};

const AttendanceSheetDialog = () => {
  const setOpen = useAttendanceDialogStore((state) => state.setOpen);
  const isOpen = useAttendanceDialogStore((state) => state.open);
  const names = useAttendanceDialogStore((state) => state.names);
  const title = useAttendanceDialogStore((state) => state.className);
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  const [numError, setNumError] = React.useState("");
  const [skipDates, setSkipDates] = React.useState<Dayjs[]>([]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const ok = validateDates();

    event.preventDefault();

    if (!ok) {
      return;
    }

    const dates: string[] = [];
    const currentDate: Date = new Date(startDate?.toDate() ?? new Date());
    const end: Date = endDate?.toDate() ?? new Date();

    while (datesCompare(currentDate, end) !== 1) {
      if (!isDateInArray(currentDate, skipDates)) {
        dates.push(getFormattedDate(currentDate));
      }

      currentDate.setDate(currentDate.getDate() + 7);
    }

    const columns = ["Last name", "First name", ...dates];
    const rows: string[][] = names.map((name) => {
      return [...name, ...dates.map((date) => "")];
    });

    // Sort the class list based on the last name, then first name
    rows.sort((a, b) => {
      const aLastName = a[0].toLowerCase().trim();
      const aFirstName = a[1].toLowerCase().trim();
      const bLastName = b[0].toLowerCase().trim();
      const bFirstName = b[1].toLowerCase().trim();
      const lastNamesEqual = aLastName === bLastName;

      return lastNamesEqual
        ? aFirstName.localeCompare(bFirstName)
        : aLastName.localeCompare(bLastName);
    });

    exportToPdf(title, columns, rows, false, true);
    setOpen(false);
  };

  const validateDates = () => {
    let result = "";

    if (startDate === null || endDate === null) {
      result = "State and end dates are required.";
    } else {
      const start = startDate?.toDate() ?? new Date();
      const end = endDate?.toDate() ?? new Date();

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (start.getTime() >= end.getTime()) {
        result = "The start date must be greater than the end date.";
      }
    }

    setNumError(result);

    return result === "";
  };

  const setSkipDate = (dateToSkip: Dayjs, index: number) => {
    const newSkipDates = [...skipDates];

    newSkipDates.splice(index, 1, dateToSkip);
    setSkipDates(newSkipDates);
  };

  const deleteSkipDate = (index: number) => {
    const newSkipDates = [...skipDates];

    newSkipDates.splice(index, 1);
    setSkipDates(newSkipDates);
  };

  React.useEffect(() => {
    validateDates();
  }, [startDate, endDate]);

  return (
    <Dialog open={isOpen} onClose={() => setOpen(false)}>
      <DialogTitle>Attendance sheet</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Set the start date for the attendance sheet and the number of days.
        </DialogContentText>
        <form onSubmit={handleSubmit} id="dialogform">
          <Box sx={{ diplay: "flex", gap: "20px", marginTop: "10px" }}>
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

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="End date for attendance sheet"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue!)}
                slotProps={{
                  textField: {
                    sx: { width: "100%", marginBottom: "10px" }, // Force full parent width
                  },
                }}
              />
            </LocalizationProvider>
            <Button
              variant="contained"
              onClick={() => {
                setSkipDates([...skipDates, dayjs(new Date())]);
              }}
            >
              Create skip date
            </Button>
            <Conditional condition={skipDates.length > 0}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Action</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {skipDates.map((row, index) => (
                      <TableRow key={"date" + index}>
                        <TableCell>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => deleteSkipDate(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label="Date to skip"
                              value={row}
                              onChange={(newValue) =>
                                setSkipDate(newValue!, index)
                              }
                              slotProps={{
                                textField: {
                                  sx: { width: "100%", marginBottom: "10px" }, // Force full parent width
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Conditional>
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
