import { ArrowDownward, ArrowUpward, PictureAsPdf } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  MRT_Row,
  MRT_TableInstance,
  // createRow,
  type MRT_ColumnDef,
} from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import usePDFTitleDialogStore from "../../../../stores/usePDFTitleDialogStore.js";
import useValidationStore from "../../../../stores/useValidationStore.js";
import Conditional from "../../../common/Conditional.js";
import { ClassesServerTypeClass } from "../classes/ClassesTable.js";
import { ClassesTableType } from "../classes/classesTypes.js";
import { BaseTable } from "../common/BaseTable.js";
import BaseServer from "../common/baseServer.js";
import ValidationUtils from "../common/validationUtils.js";
import {
  ClassListsServerType,
  ClassListsTableType,
  getFieldValue,
  reportFields,
} from "./classListsTypes.js";

export class ClassListsServerTypeClass extends BaseServer<
  ClassListsTableType,
  ClassListsServerType
> {
  public constructor() {
    super("classlists");
  }

  public mapTableToServer(
    classLists: ClassListsTableType,
  ): ClassListsServerType {
    return {
      ...classLists,
      class: classLists.classId,
    };
  }

  public mapServerToTable(
    classLists: ClassListsServerType,
  ): ClassListsTableType {
    const { name: className, id: classId } = classLists.class as {
      name: string;
      id: number;
    };
    return {
      ...classLists,
      className,
      classId,
    };
  }
}

class ClassListsTableClass extends BaseTable<
  ClassListsTableType,
  ClassListsServerType,
  ClassListsServerTypeClass
> {
  public constructor() {
    super("classlists", new ClassListsServerTypeClass(), "class lists", true);
  }

  MainClassListsTableComponent = () => {
    const MainTableComponent = this.MainTableComponent;

    return <MainTableComponent />;
  };

  public validateRow(
    classLists: ClassListsTableType,
  ): Record<string, string | undefined> {
    return {
      name: !ValidationUtils.validateRequired(classLists?.className)
        ? "Name is required."
        : "",
    };
  }

  defaultCreateRow = (): ClassListsTableType | null => {
    return {
      id: 1,
      classId: 0,
      title: "",
      className: "",
      columns: reportFields.map((field) => field.fieldName).join(","),
      class: { id: 0, name: "" },
    };
  };

  public getColumns(): MRT_ColumnDef<ClassListsTableType, unknown>[] {
    return [
      {
        accessorKey: "title",
        header: "List title",
        enableEditing: false,
      },
      {
        accessorKey: "className",
        header: "Class name",
        enableEditing: false,
      },
      {
        accessorKey: "columns",
        header: "columns",
        enableEditing: false,
      },
    ];
  }

  public getCustomRowActions(
    row: MRT_Row<ClassListsTableType>,
  ): React.FC | null {
    const handlePDFClick = async () => {
      const date = new Date();

      const options: Intl.DateTimeFormatOptions = {
        month: "long",
        day: "numeric",
        year: "numeric",
      };
      const formattedDate = date.toLocaleDateString("en-US", options);
      const pdfState = usePDFTitleDialogStore.getState();
      const columns = row.original.columns.split(",");
      const title = `${row.original.title} as of ${formattedDate}`;
      const classId = row.original.classId;
      const classServer = new ClassesServerTypeClass();
      const classData = await classServer.getRow(classId);
      const rows =
        classData?.registrants.map((registrant) => {
          const rowData: string[] = [];

          columns.forEach((column) => {
            rowData.push(getFieldValue(column, registrant));
          });

          return rowData;
        }) ?? [];

      pdfState.setTitle(title);
      pdfState.setHeadersAndRows(columns, rows);
      await pdfState.downloadPdf();
    };

    return () => (
      <Tooltip title="Export PDF">
        <IconButton onClick={handlePDFClick}>
          <PictureAsPdf />
        </IconButton>
      </Tooltip>
    );
  }

  public getCustomEditDialog(
    table: MRT_TableInstance<ClassListsTableType>,
  ): React.FC | null {
    const CustomEditForm = () => {
      const [classes, setClasses] = useState<ClassesTableType[]>([]);
      const { editingRow, creatingRow } = table.getState();
      const isCreateOrEdit = editingRow !== null || creatingRow !== null;
      const prevValues = editingRow
        ? editingRow.original
        : creatingRow
          ? creatingRow.original
          : null;
      const [values, setValues] = useState<ClassListsTableType | null>(null);
      const validationErrors = useValidationStore(
        (state) => state.validationErrors,
      );
      const setValidationErrors = useValidationStore(
        (state) => state.setValidationErrors,
      );
      const { mutateAsync: updateRowType } = this.useUpdateRowType();
      const { mutateAsync: createRowType } = this.useCreateRowType();
      const fieldHeaders: string[] = reportFields.map(
        (field) => field.fieldName,
      );
      const setHeadersAndRows = usePDFTitleDialogStore(
        (state) => state.setHeadersAndRows,
      );
      const setShowAllHeaders = usePDFTitleDialogStore(
        (state) => state.setShowAllHeaders,
      );
      const headers = usePDFTitleDialogStore((state) => state.headers);
      const setShowHeader = usePDFTitleDialogStore(
        (state) => state.setShowHeader,
      );
      const moveHeader = usePDFTitleDialogStore((state) => state.moveHeader);

      const selectionState: "all" | "some" | "none" = useMemo(() => {
        let count = 0;

        headers.forEach((header) => {
          if (header.show) {
            count++;
          }
        });

        return count === 0 ? "none" : count === headers.length ? "all" : "some";
      }, [headers]);

      const handleSelectAllClick = (
        event: React.ChangeEvent<HTMLInputElement>,
      ) => {
        setShowAllHeaders(event.target.checked);
      };

      console.log("In render headers=", JSON.stringify(headers));
      useEffect(() => {
        const classesServer = new ClassesServerTypeClass();

        const getUsers = async () => {
          const classes: ClassesTableType[] = await classesServer.getRows();

          setClasses(classes);

          if (editingRow !== null) {
            // Initialize form values when an editing row is set
            const columns =
              prevValues?.columns === ""
                ? []
                : (prevValues?.columns.split(",") ?? []);
            const allColumns = [...columns];

            console.log("Old columns=", columns);

            // Add unselected columns to the end
            fieldHeaders.forEach((fieldHeader) => {
              if (!columns.includes(fieldHeader)) {
                allColumns.push(fieldHeader);
              }
            });

            console.log("All columns=", allColumns);
            setHeadersAndRows(allColumns, []);

            // Set the selection state
            fieldHeaders.forEach((header, index) => {
              setShowHeader(index, columns.includes(header));
            });

            setValues(prevValues);
          } else {
            setHeadersAndRows(fieldHeaders, []);
            setValues(this.defaultCreateRow());
          }
        };

        getUsers();
      }, [editingRow, creatingRow]);

      const handleChange = (event: any) => {
        setValues({
          ...values!,
          [event.target.name]: event.target.value,
        });
      };

      const handleSave = async () => {
        const newValidationErrors = this.validateRow(values!);

        if (Object.values(newValidationErrors).some((error) => error)) {
          setValidationErrors(newValidationErrors);
          return;
        }

        // Convert the headers selected into columns
        const columns = headers
          .filter((header) => header.show)
          .map((header) => header.name)
          .join(",");

        console.log("Setting columns to", columns);
        console.log("Values=", JSON.stringify(values));
        const updatedValues = { ...values!, columns };

        setValidationErrors({});
        if (editingRow !== null) {
          await updateRowType(updatedValues);
          table.setEditingRow(null);
        } else {
          await createRowType(values!);
          table.setCreatingRow(null);
        }
      };

      const handleCancel = () => {
        table.setCreatingRow(null);
        table.setEditingRow(null);
      };

      if (!isCreateOrEdit) return null; // Don't render if no row is being edited

      return (
        <Dialog open={isCreateOrEdit} onClose={handleCancel}>
          <Box sx={{ padding: 2 }}>
            <h3>
              {`${creatingRow !== null ? "Create" : "Edit"} ${this.rowName} row`}
            </h3>

            <TextField
              label="Class title"
              name="title"
              required={true}
              value={values?.title}
              onChange={handleChange}
              error={!!validationErrors?.title}
              helperText={validationErrors?.title}
              fullWidth
              margin="normal"
              onFocus={() =>
                setValidationErrors({
                  ...validationErrors,
                  title: undefined,
                })
              }
            />
            <FormControl
              fullWidth
              sx={{ marginBottom: 2, marginTop: 2 }}
              required={true}
            >
              <InputLabel id="classId">Class name</InputLabel>
              <Select
                multiple={false}
                value={values?.classId}
                required={true}
                error={!!validationErrors?.classId}
                labelId="caller-label"
                input={<OutlinedInput label="Class name" />} // This prop handles the outlined input style and notches the border correctly
                onFocus={() =>
                  setValidationErrors({
                    ...validationErrors,
                    classId: undefined,
                  })
                }
                onChange={(event) => {
                  const classId = event.target.value;
                  const clazz =
                    classes.find((clazz) => clazz.id === classId) ?? null;

                  setValues({
                    ...values!,
                    classId,
                    className: clazz?.name ?? "",
                  });
                }}
              >
                {classes.map((clazz) => {
                  const className = clazz.name;

                  return (
                    <MenuItem key={className} value={clazz.id}>
                      <ListItemText primary={className} />
                    </MenuItem>
                  );
                })}
              </Select>
              <Conditional condition={!!validationErrors?.classId}>
                <FormHelperText error>
                  {validationErrors?.classId}
                </FormHelperText>
              </Conditional>
            </FormControl>

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
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                marginTop: 2,
              }}
            >
              <Button onClick={handleCancel} variant="outlined">
                Cancel
              </Button>
              <Button onClick={handleSave} variant="contained" color="primary">
                Save
              </Button>
            </Box>
          </Box>
        </Dialog>
      );
    };
    return () => <CustomEditForm />;
  }
}

const ClassListsTable: ClassListsTableClass = new ClassListsTableClass();

export default ClassListsTable;
