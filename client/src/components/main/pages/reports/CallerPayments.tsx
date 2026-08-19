import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { CallerPaymentsTable } from "./CallerPaymentsTable.js";

const PaymentContainer = styled.div`
  display: flex:
  flex-direction: column;
`;

export const CallerPayments = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    let initialStart = new Date();
    let initialEnd = new Date();

    initialStart.setDate(1);
    initialEnd.setMonth(initialEnd.getMonth() + 1);

    // Sets the date to the last day of the month
    initialEnd.setDate(0);

    setStartDate(initialStart);
    setEndDate(initialEnd);
  }, []);

  return (
    <PaymentContainer>
      <Box sx={{ marginBottom: 2 }}>
        <h3>Select the start and end dates for caller payments.</h3>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start date"
            value={dayjs(startDate)}
            onChange={(newValue) => {
              const newDate = newValue?.toDate() ?? new Date();

              setStartDate(newDate);
            }}
          />
          <DatePicker
            sx={{ marginLeft: 2 }}
            label="End date"
            value={dayjs(endDate)}
            onChange={(newValue) => {
              const newDate = newValue?.toDate() ?? new Date();

              setEndDate(newDate);
            }}
          />
        </LocalizationProvider>
      </Box>
      <CallerPaymentsTable startDate={startDate} endDate={endDate} />
    </PaymentContainer>
  );
};
