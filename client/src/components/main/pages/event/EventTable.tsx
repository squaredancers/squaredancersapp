import {
  Box,
  Button,
  Dialog,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  MRT_TableInstance,
  // createRow,
  type MRT_ColumnDef,
} from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import useValidationStore from "../../../../stores/useValidationStore.js";
import { CallerServerTypeClass } from "../caller/CallerTable.js";
import { CallerTableType } from "../caller/callerTypes.js";
import { ClassesServerTypeClass } from "../classes/ClassesTable.js";
import { ClassesTableType } from "../classes/classesTypes.js";
import { ClassInfoServerTypeClass } from "../classinfo/ClassinfoTable.js";
import { BaseTable } from "../common/BaseTable.js";
import BaseServer from "../common/baseServer.js";
import ValidationUtils from "../common/validationUtils.js";
import { LocationServerTypeClass } from "../location/LocationTable.js";
import { LocationTableType } from "../location/locationTypes.js";
import { EventServerType, EventTableType } from "./EventTypes.js";

export class EventServerTypeClass extends BaseServer<
  EventTableType,
  EventServerType
> {
  public constructor() {
    super("event");
  }

  public mapTableToServer(event: EventTableType): EventServerType {
    const { id, name, date, callerId, draft, classId, locationId } = event;
    const callerCharge = Math.trunc(parseFloat(event.callerCharge) * 100);
    const roomCharge = Math.trunc(parseFloat(event.roomCharge) * 100);
    const hours = Math.trunc(parseFloat(event.hours) * 100);

    return {
      id,
      name,
      date: date.toJSON(),
      draft,
      callerCharge,
      roomCharge,
      location: locationId,
      caller: callerId,
      class: classId,
      hours,
    };
  }

  public mapServerToTable(event: EventServerType): EventTableType {
    const { id, name, date, draft } = event;
    const caller = event.caller as {
      id: number;
      user: { id: number; firstName: string; lastName: string };
    };
    const location = event.location as {
      id: number;
      name: string;
    };
    const roomCharge = (event.roomCharge / 100).toFixed(2);
    const callerCharge = (event.callerCharge / 100).toFixed(2);
    const hours = (event.hours / 100).toFixed(2);
    const eventClass = event.class as { id: number; name: string } | null;
    const classId = eventClass?.id ?? null;

    return {
      id,
      name,
      date: new Date(date),
      draft,
      classId,
      callerCharge,
      roomCharge,
      locationId: location.id,
      locationName: location.name,
      callerId: caller.id,
      callerName: `${caller.user.firstName} ${caller.user.lastName}`,
      hours,
    };
  }
}

class EventTableClass extends BaseTable<
  EventTableType,
  EventServerType,
  EventServerTypeClass
> {
  public constructor() {
    super("event", new EventServerTypeClass(), "event", true);
  }

  MainCallerTableComponent = () => {
    const MainTableComponent = this.MainTableComponent;

    return <MainTableComponent />;
  };

  public validateRow(
    event: EventTableType,
  ): Record<string, string | undefined> {
    return {
      callerCharge: !ValidationUtils.validateNumeric(event.callerCharge)
        ? "Incorrect caller charge number value"
        : "",
      roomCharge: !ValidationUtils.validateNumeric(event.roomCharge)
        ? "Incorrect room charge number value"
        : "",
      name: !ValidationUtils.validateRequired(event.name)
        ? "Name is required"
        : "",
      locationId: event.locationId === 0 ? "No location selected" : "",
      callerId: event.callerId === 0 ? "No caller selected" : "",
    };
  }

  public getColumns(): MRT_ColumnDef<EventTableType, unknown>[] {
    return [
      {
        accessorKey: "date",
        header: "Date",
        enableEditing: false,
        Cell: ({ cell }) => (
          <span>{(cell.getValue() as Date).toISOString().split("T")[0]}</span>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        enableEditing: false,
      },
      {
        accessorKey: "callerName",
        header: "Caller",
        enableEditing: false,
      },
      {
        accessorKey: "locationName",
        header: "Location",
      },
      {
        accessorKey: "hours",
        header: "Hours",
      },
      {
        accessorKey: "roomCharge",
        header: "Room charge",
      },
      {
        accessorKey: "callerCharge",
        header: "Caller charge",
      },
    ];
  }

  public getCustomEditDialog(
    table: MRT_TableInstance<EventTableType>,
  ): React.FC | null {
    const CustomEditForm = () => {
      const { editingRow, creatingRow } = table.getState();
      const isCreateOrEdit = editingRow !== null || creatingRow !== null;
      const prevValues = editingRow
        ? editingRow.original
        : creatingRow
          ? creatingRow.original
          : null;
      const [values, setInternalValues] = useState<EventTableType | null>(null);
      const [allLocations, setAllLocations] = useState<LocationTableType[]>([]);
      const [allCallers, setAllCallers] = useState<CallerTableType[]>([]);
      const [allClasses, setAllClasses] = useState<ClassesTableType[]>([]);
      const validationErrors = useValidationStore(
        (state) => state.validationErrors,
      );
      const setValidationErrors = useValidationStore(
        (state) => state.setValidationErrors,
      );
      const { mutateAsync: updateRowType } = this.useUpdateRowType();
      const { mutateAsync: createRowType } = this.useCreateRowType();

      const setValues = (values: EventTableType | null) => {
        console.log("Setting values", { ...values });
        setInternalValues(values);
      };

      useEffect(() => {
        const callerServer = new CallerServerTypeClass();
        const locationServer = new LocationServerTypeClass();
        const classesServer = new ClassesServerTypeClass();

        const getInfo = async () => {
          const callers: CallerTableType[] = await callerServer.getRows();
          const locations: LocationTableType[] = await locationServer.getRows();
          const classes: ClassesTableType[] = await classesServer.getRows();

          setAllCallers(callers);
          setAllLocations(locations);
          setAllClasses(classes);

          if (editingRow !== null) {
            // Initialize form values when an editing row is set
            setValues(prevValues);
          } else {
            setValues({
              id: 0,
              name: "",
              date: new Date(),
              callerId: 0,
              classId: null,
              callerName: "",
              locationId: 0,
              locationName: "",
              draft: false,
              callerCharge: "0.00",
              roomCharge: "0.00",
              hours: "0",
            });
          }
        };

        getInfo();
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
        // 1. Clear any local validation errors
        // 2. Exit editing mode
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Event date"
                value={dayjs(values?.date)}
                onChange={(newValue) => {
                  const newDate = newValue?.toDate() ?? new Date();

                  setValues({
                    ...values!,
                    date: newDate,
                  });
                }}
              />
            </LocalizationProvider>
            <TextField
              label="Name"
              name="name"
              required={true}
              value={values?.name ?? ""}
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
              required={true}
              sx={{ marginTop: 2, marginBottom: 0 }}
            >
              <InputLabel id="classes-label">
                {allClasses.length === 0 ? "No classes available" : "Class"}
              </InputLabel>
              <Select
                disabled={allClasses.length === 0}
                multiple={false}
                value={values?.classId ?? 0}
                labelId="classes-label"
                input={
                  <OutlinedInput
                    label={
                      allCallers.length === 0 ? "No classes available" : "Class"
                    }
                  />
                } // This prop handles the outlined input style and notches the border correctly
                onChange={async (event) => {
                  const classId = event.target.value;
                  const clazz = allClasses.find(
                    (clazz) => clazz.id === classId,
                  );
                  const classInfo = await new ClassInfoServerTypeClass().getRow(
                    clazz?.classInfoId!,
                  );
                  //const callerCharge = classInfo?.caller.
                  setValues({
                    ...values!,
                    classId,
                    name: clazz?.name ?? "",
                    callerId: classInfo?.callerId!,
                    callerName: classInfo?.callerName!,
                    locationId: classInfo?.locationId!,
                    locationName: classInfo?.locationName!,
                  });
                }}
                renderValue={(classId) => {
                  const { className } = useMemo(() => {
                    const clazz =
                      creatingRow !== null && allCallers.length === 0
                        ? null
                        : allClasses.find((clazz) => clazz.id === classId);

                    return {
                      className: clazz?.name,
                    };
                  }, [classId, creatingRow, allClasses]);

                  return (
                    <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {className}
                    </Box>
                  );
                }}
              >
                {allClasses.map((clazz) => {
                  const name = clazz.name;

                  return (
                    <MenuItem key={clazz.id} value={clazz.id}>
                      <ListItemText primary={name} />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl
              fullWidth
              required={true}
              sx={{ marginTop: 2, marginBottom: 2 }}
            >
              <InputLabel id="caller-label">
                {allCallers.length === 0 ? "No callers available" : "Caller"}
              </InputLabel>
              <Select
                disabled={allCallers.length === 0}
                multiple={false}
                value={values?.callerId ?? 0}
                labelId="caller-label"
                input={
                  <OutlinedInput
                    label={
                      allCallers.length === 0
                        ? "No callers available"
                        : "Caller"
                    }
                  />
                } // This prop handles the outlined input style and notches the border correctly
                onChange={(event) => {
                  const callerId = event.target.value;
                  const caller = allCallers.find(
                    (caller) => caller.id === callerId,
                  );

                  setValues({
                    ...values!,
                    callerId,
                    callerName: `${caller?.firstName} ${caller?.lastName}`,
                    callerCharge: caller?.hourlyRate ?? "0.00",
                  });
                }}
                renderValue={(callerId) => {
                  const { firstName, lastName } = useMemo(() => {
                    const caller =
                      creatingRow !== null && allCallers.length === 0
                        ? null
                        : allCallers.find((caller) => caller.id === callerId);

                    return {
                      firstName: caller?.firstName ?? "",
                      lastName: caller?.lastName ?? "",
                    };
                  }, [callerId, creatingRow, allCallers]);

                  return (
                    <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {`${firstName} ${lastName}`}
                    </Box>
                  );
                }}
              >
                {allCallers.map((caller) => {
                  const name = `${caller.firstName} ${caller.lastName}`;
                  return (
                    <MenuItem key={caller.id} value={caller.id}>
                      <ListItemText primary={name} />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl fullWidth required={true}>
              <InputLabel id="location-label">
                {allLocations.length === 0
                  ? "No locations available"
                  : "Location"}
              </InputLabel>
              <Select
                disabled={allLocations.length === 0}
                multiple={false}
                value={values?.locationId ?? 0}
                labelId="location-label"
                input={
                  <OutlinedInput
                    label={
                      allLocations.length === 0
                        ? "No locations available"
                        : "Location"
                    }
                  />
                } // This prop handles the outlined input style and notches the border correctly
                onChange={(event) => {
                  const locationId = event.target.value;
                  const location = allLocations.find(
                    (location) => location.id === locationId,
                  );

                  setValues({
                    ...values!,
                    locationId,
                    locationName: location?.name ?? "",
                    roomCharge: location?.rent ?? "",
                  });
                }}
                renderValue={(locationId) => {
                  const { locationName } = useMemo(() => {
                    const location =
                      creatingRow !== null && allLocations.length === 0
                        ? null
                        : allLocations.find(
                            (location) => location.id === locationId,
                          );

                    return {
                      locationName: location?.name ?? "",
                    };
                  }, [locationId, creatingRow, allLocations]);

                  return (
                    <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {locationName}
                    </Box>
                  );
                }}
              >
                {allLocations.map((location) => {
                  const name = location.name;

                  return (
                    <MenuItem key={location.id} value={location.id}>
                      <ListItemText primary={name} />
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
            <TextField
              label="Room charge"
              name="roomCharge"
              required={true}
              value={values?.roomCharge ?? "0.00"}
              onChange={handleChange}
              error={!!validationErrors?.roomCharge}
              helperText={validationErrors?.roomCharge}
              fullWidth
              margin="normal"
              onFocus={() =>
                setValidationErrors({
                  ...validationErrors,
                  roomCharge: undefined,
                })
              }
            />
            <TextField
              label="Caller charge"
              name="callerCharge"
              required={true}
              value={values?.callerCharge ?? "0.00"}
              onChange={handleChange}
              error={!!validationErrors?.callerCharge}
              helperText={validationErrors?.callerCharge}
              fullWidth
              margin="normal"
              onFocus={() =>
                setValidationErrors({
                  ...validationErrors,
                  callerCharge: undefined,
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
              <Button
                onClick={handleSave}
                variant="contained"
                color="primary"
                disabled={
                  (allCallers.length === 0 || allLocations.length === 0) &&
                  creatingRow !== null
                }
              >
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

const EventTable: EventTableClass = new EventTableClass();

export default EventTable;
