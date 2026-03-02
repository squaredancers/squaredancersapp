import {
  Box,
  Button,
  Dialog,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";
import {
  MRT_TableInstance,
  // createRow,
  type MRT_ColumnDef,
} from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import useValidationStore from "../../../../stores/useValidationStore.js";
import Conditional from "../../../common/Conditional.js";
import { CallerServerTypeClass } from "../caller/CallerTable.js";
import { CallerTableType } from "../caller/callerTypes.js";
import { BaseTable } from "../common/BaseTable.js";
import BaseServer from "../common/baseServer.js";
import ValidationUtils from "../common/validationUtils.js";
import { LocationServerTypeClass } from "../location/LocationTable.js";
import { LocationTableType } from "../location/locationTypes.js";
import {
  ClassInfoServerType,
  ClassInfoTableType,
  DaysType,
} from "./classInfoTypes.js";

export class ClassInfoServerTypeClass extends BaseServer<
  ClassInfoTableType,
  ClassInfoServerType
> {
  public constructor() {
    super("classinfo");
  }

  public mapTableToServer(classInfo: ClassInfoTableType): ClassInfoServerType {
    const { id, name, day, locationId, callerId } = classInfo;
    const hours = Math.trunc(parseFloat(classInfo.hours) * 100);

    return {
      id,
      name,
      day,
      hours,
      location: locationId,
      caller: callerId,
    };
  }

  public mapServerToTable(classInfo: ClassInfoServerType): ClassInfoTableType {
    const caller = classInfo.caller as {
      id: number;
      hourlyRate?: number;
      user: { firstName: string; lastName: string; id: number };
    };
    const { name: locationName, id: locationId } = classInfo.location as {
      id: number;
      name: string;
    };
    const hours = (classInfo.hours / 100).toFixed(2);
    const { id, name, day } = classInfo;

    return {
      id,
      name,
      day,
      hours,
      callerName: `${caller.user.firstName} ${caller.user.lastName}`,
      locationName,
      callerId: caller.id,
      locationId,
      hourlyRate: caller.hourlyRate,
    };
  }
}

class ClassInfoTableClass extends BaseTable<
  ClassInfoTableType,
  ClassInfoServerType,
  ClassInfoServerTypeClass
> {
  public constructor() {
    super("classinfo", new ClassInfoServerTypeClass(), "class info", true);
  }

  MainCallerTableComponent = () => {
    const MainTableComponent = this.MainTableComponent;

    return <MainTableComponent />;
  };

  public validateRow(
    classInfo: ClassInfoTableType,
  ): Record<string, string | undefined> {
    return {
      name: !ValidationUtils.validateRequired(classInfo?.name)
        ? "Name is required."
        : "",
      day: !ValidationUtils.validateRequired(classInfo?.day)
        ? "Day is required."
        : "",
      hours: !ValidationUtils.validateNumeric(classInfo?.hours)
        ? "Incorrect number value for hours"
        : "",
      callerName: !ValidationUtils.validateRequired(classInfo?.callerName)
        ? "Caller name is required."
        : "",
      locationName: !ValidationUtils.validateRequired(classInfo?.locationName)
        ? "Location is required."
        : "",
    };
  }

  defaultCreateRow = (): ClassInfoTableType | null => {
    return {
      id: 1,
      name: "",
      day: DaysType.Monday,
      hours: "0",
      callerId: 0,
      callerName: "",
      locationId: 0,
      locationName: "",
    };
  };

  public getColumns(): MRT_ColumnDef<ClassInfoTableType, unknown>[] {
    return [
      {
        accessorKey: "name",
        header: "Class name",
        enableEditing: false,
      },
      {
        accessorKey: "callerName",
        header: "Caller name",
        enableEditing: false,
      },
      {
        accessorKey: "day",
        header: "Day",
        enableEditing: false,
      },
      {
        accessorKey: "hours",
        header: "Hours",
      },
      {
        accessorKey: "locationName",
        header: "Location name",
      },
    ];
  }

  public getCustomEditDialog(
    table: MRT_TableInstance<ClassInfoTableType>,
  ): React.FC | null {
    const CustomEditForm = () => {
      const { editingRow, creatingRow } = table.getState();
      const isCreateOrEdit = editingRow !== null || creatingRow !== null;
      const prevValues = editingRow
        ? editingRow.original
        : creatingRow
          ? creatingRow.original
          : null;
      const [values, setValues] = useState<ClassInfoTableType | null>(null);
      const [callers, setCallers] = useState<CallerTableType[]>([]);
      const [locations, setLocations] = useState<LocationTableType[]>([]);
      const validationErrors = useValidationStore(
        (state) => state.validationErrors,
      );
      const setValidationErrors = useValidationStore(
        (state) => state.setValidationErrors,
      );
      const { mutateAsync: updateRowType } = this.useUpdateRowType();
      const { mutateAsync: createRowType } = this.useCreateRowType();

      useEffect(() => {
        const callerServer = new CallerServerTypeClass();
        const locationServer = new LocationServerTypeClass();

        const getUsers = async () => {
          const callers: CallerTableType[] = await callerServer.getRows();
          const locations: LocationTableType[] = await locationServer.getRows();
          const activeCallers = callers.filter((caller) => caller.active);

          setCallers(activeCallers);
          setLocations(locations);

          if (editingRow !== null) {
            // Initialize form values when an editing row is set
            setValues(prevValues);
          } else {
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

        setValidationErrors({});
        if (editingRow !== null) {
          await updateRowType(values!);
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

      const allDays = useMemo(() => {
        return Object.keys(DaysType);
      }, []);

      if (!isCreateOrEdit) return null; // Don't render if no row is being edited

      return (
        <Dialog open={isCreateOrEdit} onClose={handleCancel}>
          <Box sx={{ padding: 2 }}>
            <h3>
              {`${creatingRow !== null ? "Create" : "Edit"} ${this.rowName} row`}
            </h3>

            <TextField
              label="Class name"
              name="name"
              required={true}
              value={values?.name}
              onChange={handleChange}
              error={!!validationErrors?.name}
              helperText={validationErrors?.name}
              fullWidth
              margin="normal"
              onFocus={() =>
                setValidationErrors({
                  ...validationErrors,
                  name: undefined,
                })
              }
            />
            <FormControl
              fullWidth
              sx={{ marginBottom: 2, marginTop: 2 }}
              required={true}
            >
              <InputLabel id="caller-label">Caller</InputLabel>
              <Select
                multiple={false}
                value={values?.callerId}
                required={true}
                error={!!validationErrors?.callerName}
                labelId="caller-label"
                input={<OutlinedInput label="Caller" />} // This prop handles the outlined input style and notches the border correctly
                onFocus={() =>
                  setValidationErrors({
                    ...validationErrors,
                    callerName: undefined,
                  })
                }
                onChange={(event) => {
                  const callerId = event.target.value;
                  const caller = callers.find(
                    (caller) => (caller.id = callerId),
                  );

                  setValues({
                    ...values!,
                    callerId,
                    callerName: `${caller?.firstName} ${caller?.lastName}`,
                  });
                }}
              >
                {callers.map((caller) => {
                  const callerName = `${caller?.firstName} ${caller?.lastName}`;

                  return (
                    <MenuItem key={callerName} value={caller.id}>
                      <ListItemText primary={callerName} />
                    </MenuItem>
                  );
                })}
              </Select>
              <Conditional condition={!!validationErrors?.callerName}>
                <FormHelperText error>
                  {validationErrors?.callerName}
                </FormHelperText>
              </Conditional>
            </FormControl>
            <FormControl fullWidth required={true}>
              <InputLabel id="day-label">Day</InputLabel>
              <Select
                multiple={false}
                value={values?.day ?? ""}
                labelId="day-label"
                input={<OutlinedInput label="Day" />} // This prop handles the outlined input style and notches the border correctly
                onChange={(event) => {
                  const newDay = event.target.value;

                  setValues({
                    ...values!,
                    day: newDay,
                  });
                }}
              >
                {allDays.map((day) => {
                  return (
                    <MenuItem key={day} value={day}>
                      <ListItemText primary={day} />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <TextField
              label="Hours"
              name="hours"
              required={true}
              value={values?.hours ?? "0"}
              onChange={handleChange}
              error={!!validationErrors?.hours}
              helperText={validationErrors?.hours}
              fullWidth
              margin="normal"
              onFocus={() =>
                setValidationErrors({
                  ...validationErrors,
                  hours: undefined,
                })
              }
            />
            <FormControl fullWidth required={true} sx={{ marginTop: 2 }}>
              <InputLabel id="location-label">Location</InputLabel>
              <Select
                multiple={false}
                value={values?.locationId}
                labelId="location-label"
                error={!!validationErrors?.locationName}
                input={<OutlinedInput label="Location" />} // This prop handles the outlined input style and notches the border correctly
                onChange={(event) => {
                  const locationId = event.target.value;
                  const location = locations.find(
                    (location) => (location.id = locationId),
                  );

                  setValues({
                    ...values!,
                    locationId,
                    locationName: location?.name ?? "",
                  });
                }}
              >
                {locations.map((location) => {
                  return (
                    <MenuItem key={location.name} value={location.id}>
                      <ListItemText primary={location.name} />
                    </MenuItem>
                  );
                })}
              </Select>
              <Conditional condition={!!validationErrors?.locationName}>
                <FormHelperText error>
                  {validationErrors?.locationName}
                </FormHelperText>
              </Conditional>
            </FormControl>

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

const ClassInfoTable: ClassInfoTableClass = new ClassInfoTableClass();

export default ClassInfoTable;
