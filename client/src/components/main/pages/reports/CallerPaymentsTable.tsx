import styled from "@emotion/styled";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";
import Server from "../../../../server/server.js";

interface Row {
  name: string;
  description: string;
}

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "grey",
    color: "white",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

export const CallerPaymentsTable = (props: {
  startDate: Date;
  endDate: Date;
}) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [allTotal, setAllTotal] = useState(0);

  useEffect(() => {
    let bigTotal = 0;

    const getData = async () => {
      const callerData = await Server.getCallerHours(
        props.startDate,
        props.endDate,
      );

      const newRows: Row[] = callerData.map((caller) => {
        const hours = caller.hours / 100;
        const rate = (caller.hourlyRate / 100).toFixed(2);
        const total = (hours * caller.hourlyRate) / 100;

        bigTotal += total;

        return {
          name: `${caller.user.firstName} ${caller.user.lastName}`,
          description: `${hours.toFixed(2)} hours @ \$${rate}/hour = \$${total.toFixed(2)}`,
        };
      });

      setRows(newRows);
      setAllTotal(bigTotal);
    };

    getData();
  }, [props.startDate, props.endDate]);

  return (
    <TableContainer component={Paper} sx={{ width: 500 }}>
      <Table aria-label="caller table">
        <TableHead>
          <TableRow>
            <StyledTableCell align="left">Caller name</StyledTableCell>
            <StyledTableCell align="right">Hours description</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell align="left">{row.name}</TableCell>
              <TableCell align="right">{row.description}</TableCell>
            </TableRow>
          ))}
          <TableRow key="total">
            <TableCell align="left">Total</TableCell>
            <TableCell align="right">{`\$${allTotal.toFixed(2)}`}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
