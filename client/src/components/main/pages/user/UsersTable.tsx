import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  FormControl,
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
import { useEffect, useState } from "react";
import useRolesStore from "../../../../stores/useRolesStore.js";
import useValidationStore from "../../../../stores/useValidationStore.js";
import BaseServer from "../common/baseServer.js";
import { BaseTable } from "../common/BaseTable.js";
import ValidationUtils from "../common/validationUtils.js";
import { UserServerType, UserTableType } from "./userTypes.js";

export class UserServerTypeClass extends BaseServer<
  UserTableType,
  UserServerType
> {
  public constructor() {
    super("user");
  }

  public getPath() {
    return `${super.getPath()}/all`;
  }

  public mapTableToServer(user: UserTableType): UserServerType {
    const { id, firstName, lastName, phone, email, roles, password } = user;

    return {
      id,
      firstName,
      lastName,
      phone,
      email,
      password,
      roles: roles.length === 0 ? null : roles.join(","),
    };
  }

  public mapServerToTable(user: UserServerType): UserTableType {
    const { id, firstName, lastName, phone, email, roles } = user;
    return {
      id,
      firstName,
      lastName,
      phone,
      email,
      password: "1234",
      roles: roles?.split(",") ?? [],
    };
  }
}

class UserTableClass extends BaseTable<
  UserTableType,
  UserServerType,
  UserServerTypeClass
> {
  public constructor() {
    super("user", new UserServerTypeClass(), "user", true);
  }

  MainUserTableComponent = () => {
    const MainTableComponent = this.MainTableComponent;

    return <MainTableComponent />;
  };

  public validateRow(user: UserTableType): Record<string, string | undefined> {
    const result = {
      firstName: !ValidationUtils.validateRequired(user.firstName)
        ? "First Name is Required"
        : "",
      lastName: !ValidationUtils.validateRequired(user.lastName)
        ? "Last Name is Required"
        : "",
      email: !ValidationUtils.validateEmail(user.email)
        ? "Incorrect Email Format"
        : "",
    };

    console.log("In validation row:", result);
    return result;
  }

  public getColumns(): MRT_ColumnDef<UserTableType, unknown>[] {
    const validationErrors = useValidationStore.getState().validationErrors;
    const setValidationErrors =
      useValidationStore.getState().setValidationErrors;

    return [
      {
        accessorKey: "firstName",
        header: "First Name",
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "phone",
        header: "Phone",
      },
      {
        accessorKey: "roles",
        header: "Roles",
        // Custom rendering for the cell value
        Cell: ({ cell }) => (
          <span>{(cell.getValue() as string[]).join(", ")}</span>
        ),
      },
    ];
  }

  public getCustomEditDialog(
    table: MRT_TableInstance<UserTableType>,
  ): React.FC | null {
    const CustomEditForm = () => {
      const { editingRow, creatingRow } = table.getState();
      const isCreateOrEdit = editingRow !== null || creatingRow !== null;
      const prevValues = editingRow
        ? editingRow.original
        : creatingRow
          ? creatingRow.original
          : null;
      const [values, setInternalValues] = useState<UserTableType | null>(null);
      const availableRoles = useRolesStore.getState().availableRoles;
      const validationErrors = useValidationStore(
        (state) => state.validationErrors,
      );
      const setValidationErrors = useValidationStore(
        (state) => state.setValidationErrors,
      );
      const { mutateAsync: updateRowType } = this.useUpdateRowType();
      const { mutateAsync: createRowType } = this.useCreateRowType();

      const setValues = (values: UserTableType | null) => {
        console.log("Setting values", { ...values });
        setInternalValues(values);
      };

      useEffect(() => {
        const getInfo = async () => {
          if (editingRow !== null) {
            // Initialize form values when an editing row is set
            setValues(prevValues);
          } else {
            setValues({
              id: 0,
              firstName: "",
              lastName: "",
              phone: "",
              email: "",
              password: "",
              roles: [],
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

            <TextField
              label="First name"
              name="firstName"
              required={true}
              value={values?.firstName ?? ""}
              onChange={handleChange}
              error={!!validationErrors?.firstName}
              helperText={validationErrors?.firstName}
              fullWidth
              margin="normal"
              onFocus={() =>
                setValidationErrors({
                  ...validationErrors,
                  firstName: undefined,
                })
              }
            />
            <TextField
              label="Last name"
              name="lastName"
              required={true}
              value={values?.lastName ?? ""}
              onChange={handleChange}
              error={!!validationErrors?.lastName}
              helperText={validationErrors?.lastName}
              fullWidth
              margin="normal"
              onFocus={() =>
                setValidationErrors({
                  ...validationErrors,
                  lastName: undefined,
                })
              }
            />
            <TextField
              label="Email"
              name="email"
              required={true}
              value={values?.email ?? ""}
              onChange={handleChange}
              error={!!validationErrors?.email}
              helperText={validationErrors?.email}
              fullWidth
              margin="normal"
              onFocus={() =>
                setValidationErrors({
                  ...validationErrors,
                  email: undefined,
                })
              }
            />
            <TextField
              label="Phone"
              name="phone"
              required={true}
              value={values?.phone ?? ""}
              onChange={handleChange}
              error={!!validationErrors?.phone}
              helperText={validationErrors?.phone}
              fullWidth
              margin="normal"
              onFocus={() =>
                setValidationErrors({
                  ...validationErrors,
                  phone: undefined,
                })
              }
            />
            <FormControl fullWidth required={false} sx={{ marginTop: 2 }}>
              <InputLabel id="roles-label">{"Roles"}</InputLabel>

              <Select
                multiple={true}
                value={values?.roles || []} // Default to empty array if value is null/undefined
                onChange={(event) => {
                  const newRoles = event.target.value as string[];
                  console.log("New value=", newRoles);
                  // MUI Select with multiple={true} returns an array of values directly
                  setValues({ ...values!, roles: newRoles });

                  //handleRolesUpdate(newValue, rowId);
                  //onChange(newValue);
                }}
                input={<OutlinedInput label="Roles" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    <Checkbox checked={values?.roles.includes(role)} />
                    <ListItemText primary={role} />
                  </MenuItem>
                ))}
              </Select>
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

const UserTable: UserTableClass = new UserTableClass();

export default UserTable;
