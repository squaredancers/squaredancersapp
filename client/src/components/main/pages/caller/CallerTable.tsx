import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormControl,
  FormControlLabel,
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
import { BaseTable } from "../common/BaseTable.js";
import BaseServer from "../common/baseServer.js";
import ValidationUtils from "../common/validationUtils.js";
import { UserServerTypeClass } from "../user/UsersTable.js";
import { UserTableType } from "../user/userTypes.js";
import { CallerServerType, CallerTableType } from "./callerTypes.js";

export class CallerServerTypeClass extends BaseServer<
  CallerTableType,
  CallerServerType
> {
  public constructor() {
    super("caller");
  }

  public mapTableToServer(caller: CallerTableType): CallerServerType {
    const { id, userId, active } = caller;
    const hourlyRate = Math.trunc(parseFloat(caller.hourlyRate) * 100);

    return {
      id,
      hourlyRate,
      user: userId,
      active,
    };
  }

  public mapServerToTable(caller: CallerServerType): CallerTableType {
    const user = caller.user as {
      firstName: string;
      lastName: string;
      id: number;
    };
    const hourlyRate = (caller.hourlyRate / 100).toFixed(2);

    return {
      id: caller.id,
      firstName: user.firstName,
      lastName: user.lastName,
      hourlyRate,
      active: caller.active,
      userId: user.id,
    };
  }
}

class CallerTableClass extends BaseTable<
  CallerTableType,
  CallerServerType,
  CallerServerTypeClass
> {
  public constructor() {
    super("caller", new CallerServerTypeClass(), "caller", true);
  }

  MainCallerTableComponent = () => {
    const MainTableComponent = this.MainTableComponent;

    return <MainTableComponent />;
  };

  public validateRow(
    caller: CallerTableType,
  ): Record<string, string | undefined> {
    return {
      hourlyRate: !ValidationUtils.validateNumeric(caller.hourlyRate)
        ? "Incorrect hourly rate number value"
        : "",
    };
  }

  public getColumns(): MRT_ColumnDef<CallerTableType, unknown>[] {
    return [
      {
        accessorKey: "firstName",
        header: "First Name",
        enableEditing: false,
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
        enableEditing: false,
      },
      {
        accessorKey: "hourlyRate",
        header: "Hourly rate",
      },
      {
        accessorKey: "active", // The field in your data (e.g., a boolean)
        header: "Is Active",
        // Custom cell rendering for display
        Cell: ({ cell }) => (
          <Checkbox
            checked={cell.getValue() as boolean}
            disabled
            sx={{ cursor: "not-allowed" }}
          />
        ),
      },
    ];
  }

  public getCustomEditDialog(
    table: MRT_TableInstance<CallerTableType>,
  ): React.FC | null {
    const CustomEditForm = () => {
      const { editingRow, creatingRow } = table.getState();
      const allCallers = table.getRowModel().rows;

      const isCreateOrEdit = editingRow !== null || creatingRow !== null;
      const prevValues = editingRow
        ? editingRow.original
        : creatingRow
          ? creatingRow.original
          : null;
      const [values, setValues] = useState<CallerTableType | null>(null);
      const [users, setUsers] = useState<UserTableType[]>([]);
      const [allUsers, setAllUsers] = useState<UserTableType[]>([]);
      const validationErrors = useValidationStore(
        (state) => state.validationErrors,
      );
      const setValidationErrors = useValidationStore(
        (state) => state.setValidationErrors,
      );
      const { mutateAsync: updateRowType } = this.useUpdateRowType();
      const { mutateAsync: createRowType } = this.useCreateRowType();

      useEffect(() => {
        const userServer = new UserServerTypeClass();

        const getUsers = async () => {
          const users: UserTableType[] = await userServer.getRows();
          console.log("Users=", users, "Callers", allCallers);

          const filteredUsers = users.filter((user) => {
            const someCall = !allCallers.some(
              (caller) => caller.original.userId === user.id,
            );

            console.log("Checking if ", user.id, "already exists ", someCall);

            return someCall;
          });

          setUsers(filteredUsers);
          setAllUsers(users);
          console.log("Filtered users=", filteredUsers);

          if (editingRow !== null) {
            // Initialize form values when an editing row is set
            console.log("Edit previous values=", prevValues);
            setValues(prevValues);
          } else {
            setValues({
              id: 0,
              userId: 0,
              firstName: "",
              lastName: "",
              hourlyRate: "0.00",
              active: true,
            });
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

            <FormControl fullWidth required={true}>
              <InputLabel id="user-label">
                {users.length === 0 ? "No additional users available" : "User"}
              </InputLabel>
              <Select
                disabled={users.length === 0}
                multiple={false}
                value={values?.userId ?? 1}
                labelId="user-label"
                input={
                  <OutlinedInput
                    label={
                      users.length === 0
                        ? "No additional users available"
                        : "User"
                    }
                  />
                } // This prop handles the outlined input style and notches the border correctly
                onChange={(event) => {
                  const userId = event.target.value;
                  const user = users.find((user) => user.id === userId);

                  setValues({
                    ...values!,
                    userId,
                    firstName: user?.firstName ?? "",
                    lastName: user?.lastName ?? "",
                  });
                }}
                renderValue={(userId) => {
                  const { firstName, lastName } = useMemo(() => {
                    const user =
                      creatingRow !== null && users.length === 0
                        ? null
                        : allUsers.find((user) => user.id === userId);

                    console.log(
                      "User = ",
                      user,
                      "creating row",
                      creatingRow,
                      "users",
                      users,
                    );
                    return {
                      firstName: user?.firstName ?? "",
                      lastName: user?.lastName ?? "",
                    };
                  }, [userId, creatingRow, users]);

                  return (
                    <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {`${firstName} ${lastName}`}
                    </Box>
                  );
                }}
              >
                {users.map((user) => {
                  const name = `${user.firstName} ${user.lastName}`;
                  return (
                    <MenuItem key={user.id} value={user.id}>
                      <ListItemText primary={name} />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <TextField
              label="Hourly rate"
              name="hourlyRate"
              required={true}
              value={values?.hourlyRate ?? "0.00"}
              onChange={handleChange}
              error={!!validationErrors?.hourlyRate}
              helperText={validationErrors?.hourlyRate}
              fullWidth
              margin="normal"
              onFocus={() =>
                setValidationErrors({
                  ...validationErrors,
                  hourlyRate: undefined,
                })
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={values?.active ?? true}
                  onChange={(e) =>
                    setValues({ ...values!, active: e.target.checked })
                  }
                />
              }
              label="active"
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
                disabled={users.length === 0 && creatingRow !== null}
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

const CallerTable: CallerTableClass = new CallerTableClass();

export default CallerTable;
