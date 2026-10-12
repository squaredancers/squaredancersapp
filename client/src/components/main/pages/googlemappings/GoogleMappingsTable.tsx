import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";

import {
  MRT_Row,
  MRT_TableInstance,
  // createRow,
  type MRT_ColumnDef,
} from "material-react-table";
import { BaseTable } from "../common/BaseTable.js";

import { useEffect, useState } from "react";
import { MAPPING_SETTINGS } from "../../../../stores/useSettingsStore.js";
import useValidationStore from "../../../../stores/useValidationStore.js";
import Conditional from "../../../common/Conditional.js";
import {
  SettingsServerType,
  SettingsServerTypeClass,
  SettingsTableType,
} from "../common/settingsServer.js";

export const fields = [
  "NoMapping",
  "Firstname",
  "Lastname",
  "Email",
  "Phone",
  "Timestamp",
  "HowWillPay",
  "PaymentType",
  "Class",
] as const;

const howToPayValues = ["etransfer", "cash", "creditcard"];
const paymentTypeValues = ["session", "perClass"];
interface GoogleMappingsTableType extends SettingsTableType {
  columnNum: number;
  field: string;
  startsWith: string;
  useColValue: boolean;
  value: string;
}

class GoogleMappingsTableClass extends BaseTable<
  GoogleMappingsTableType,
  SettingsServerType,
  SettingsServerTypeClass<GoogleMappingsTableType, SettingsServerType>
> {
  public constructor() {
    super(
      "googlemappings",
      new SettingsServerTypeClass(MAPPING_SETTINGS),
      "googlemappings",
      true,
    );
  }

  MainGoogleMappingsTableComponent = () => {
    const MainTableComponent = this.MainTableComponent;

    return <MainTableComponent />;
  };

  public validateRow(
    googleMapping: SettingsTableType,
  ): Record<string, string | undefined> {
    return {};
  }

  defaultCreateRow = (): GoogleMappingsTableType | null => {
    return {
      id: 1,
      name: "GoogleMapping",
      columnNum: 1,
      field: "",
      value: "",
      useColValue: true,
      startsWith: "",
      jsonString: "[]",
    };
  };

  public getColumns(): MRT_ColumnDef<GoogleMappingsTableType, unknown>[] {
    return [
      {
        accessorKey: "columnNum",
        header: "Column num",
        enableEditing: false,
      },
      {
        accessorKey: "field",
        header: "Field",
        enableEditing: false,
      },
      {
        accessorKey: "startsWith",
        header: "Starts with",
        Cell: ({ cell }) => (
          <span>
            {cell.row.original.useColValue ? "" : cell.row.original.startsWith}
          </span>
        ),
      },
      {
        accessorKey: "value",
        header: "Value",
        Cell: ({ cell }) => (
          <span>
            {cell.row.original.useColValue
              ? "Use column value"
              : cell.row.original.value}
          </span>
        ),
      },
    ];
  }

  public getCustomRowActions(
    row: MRT_Row<GoogleMappingsTableType>,
    table: MRT_TableInstance<GoogleMappingsTableType>,
    refreshRows: () => Promise<void>,
  ): React.FC | null {
    const move = async (moveUp: boolean) => {
      await this.server.moveRow(row.original, moveUp);
      await refreshRows();
    };

    return () => {
      const isFirst = row.original.id === 0;
      const isLast =
        row.original.id === table.getPrePaginationRowModel().rows.length - 1;
      return (
        <>
          <Tooltip title="Move up">
            <span>
              <IconButton disabled={isFirst} onClick={() => move(true)}>
                <ArrowUpward />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move down">
            <span>
              <IconButton disabled={isLast} onClick={() => move(false)}>
                <ArrowDownward />
              </IconButton>
            </span>
          </Tooltip>
        </>
      );
    };
  }

  public getCustomEditDialog(
    table: MRT_TableInstance<GoogleMappingsTableType>,
  ): React.FC | null {
    const CustomEditForm = () => {
      const { editingRow, creatingRow } = table.getState();
      const isCreateOrEdit = editingRow !== null || creatingRow !== null;
      const prevValues = editingRow
        ? editingRow.original
        : creatingRow
          ? creatingRow.original
          : null;
      const [values, setValues] = useState<GoogleMappingsTableType | null>(
        null,
      );
      const validationErrors = useValidationStore(
        (state) => state.validationErrors,
      );
      const setValidationErrors = useValidationStore(
        (state) => state.setValidationErrors,
      );
      const { mutateAsync: updateRowType } = this.useUpdateRowType();
      const { mutateAsync: createRowType } = this.useCreateRowType();
      useEffect(() => {
        const initData = async () => {
          if (editingRow !== null) {
            // Initialize form values when an editing row is set
            setValues(prevValues);
          } else {
            setValues(this.defaultCreateRow());
          }
        };

        initData();
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

        setValidationErrors({});

        const updatedValues = { ...values! };
        const { columnNum, field, startsWith, value, useColValue } = values!;

        updatedValues.jsonString = JSON.stringify({
          columnNum,
          field,
          startsWith,
          value,
          useColValue,
        });

        if (editingRow !== null) {
          await updateRowType(updatedValues);
          table.setEditingRow(null);
        } else {
          await createRowType(updatedValues);
          table.setCreatingRow(null);
        }
      };

      const handleCancel = () => {
        table.setCreatingRow(null);
        table.setEditingRow(null);
      };

      if (!isCreateOrEdit) return null; // Don't render if no row is being edited

      const numbers = new Array<number>(12).fill(0);
      const hasSelectableValues = values?.field === "";

      return (
        <Dialog open={isCreateOrEdit} onClose={handleCancel}>
          <Box sx={{ padding: 2 }}>
            <h3>
              {`${creatingRow !== null ? "Create" : "Edit"} ${this.rowName} row`}
            </h3>

            <FormControl
              fullWidth
              sx={{ marginBottom: 2, marginTop: 2 }}
              required={true}
            >
              <InputLabel id="column-label">Column num</InputLabel>
              <Select
                multiple={false}
                value={values?.columnNum + ""}
                required={true}
                error={!!validationErrors?.columnNum}
                labelId="columnnum-label"
                input={<OutlinedInput label="Column num" />} // This prop handles the outlined input style and notches the border correctly
                onFocus={() =>
                  setValidationErrors({
                    ...validationErrors,
                    columnNum: undefined,
                  })
                }
                onChange={(event) => {
                  const columnNum = parseInt(event.target.value);

                  setValues({
                    ...values!,
                    columnNum,
                  });
                }}
              >
                {numbers.map((num, index) => {
                  return (
                    <MenuItem key={"num" + index} value={index + 1 + ""}>
                      <ListItemText primary={index + 1 + ""} />
                    </MenuItem>
                  );
                })}
              </Select>
              <Conditional condition={!!validationErrors?.columnNum}>
                <FormHelperText error>
                  {validationErrors?.columnNum}
                </FormHelperText>
              </Conditional>
            </FormControl>
            <FormControl
              fullWidth
              sx={{ marginBottom: 2, marginTop: 2 }}
              required={true}
            >
              <InputLabel id="field-label">Field</InputLabel>
              <Select
                multiple={false}
                value={values?.field}
                required={true}
                error={!!validationErrors?.field}
                labelId="field-label"
                input={<OutlinedInput label="Field" />} // This prop handles the outlined input style and notches the border correctly
                onFocus={() =>
                  setValidationErrors({
                    ...validationErrors,
                    field: undefined,
                  })
                }
                onChange={(event) => {
                  setValues({
                    ...values!,
                    field: event.target.value,
                  });
                }}
              >
                {fields.map((field, index) => {
                  return (
                    <MenuItem key={"field" + index} value={field}>
                      <ListItemText primary={field} />
                    </MenuItem>
                  );
                })}
              </Select>
              <Conditional condition={!!validationErrors?.field}>
                <FormHelperText error>{validationErrors?.field}</FormHelperText>
              </Conditional>
            </FormControl>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values?.useColValue}
                    onChange={(event) => {
                      setValues({
                        ...values!,
                        useColValue: event.target.checked,
                      });
                    }}
                    color="primary"
                  />
                }
                label="Use column Value?"
              />
            </FormGroup>
            <TextField
              label="Starts with"
              disabled={values?.useColValue}
              name="startsWith"
              required={true}
              value={values?.useColValue ? "" : values?.startsWith}
              onChange={handleChange}
              error={!!validationErrors?.startsWith}
              helperText={validationErrors?.startsWith}
              fullWidth
              margin="normal"
              onFocus={() =>
                setValidationErrors({
                  ...validationErrors,
                  startsWith: undefined,
                })
              }
            />
            <TextField
              label="Value"
              disabled={values?.useColValue}
              name="value"
              required={true}
              value={values?.useColValue ? "" : values?.value}
              onChange={handleChange}
              error={!!validationErrors?.value}
              helperText={validationErrors?.value}
              fullWidth
              margin="normal"
              onFocus={() =>
                setValidationErrors({
                  ...validationErrors,
                  value: undefined,
                })
              }
            />
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

const GoogleMappingsTable: GoogleMappingsTableClass =
  new GoogleMappingsTableClass();

export default GoogleMappingsTable;
