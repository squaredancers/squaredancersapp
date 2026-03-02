import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import {
  // createRow,
  type MRT_ColumnDef,
} from "material-react-table";
import { useState } from "react";
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
    super("user", new UserServerTypeClass(), "user");
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
    const availableRoles = useRolesStore.getState().availableRoles;

    return [
      {
        accessorKey: "firstName",
        header: "First Name",
        muiEditTextFieldProps: {
          required: true,
          variant: "outlined",
          error: !!validationErrors?.firstName,
          helperText: validationErrors?.firstName,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              firstName: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
        muiEditTextFieldProps: {
          required: true,
          variant: "outlined",
          error: !!validationErrors?.lastName,
          helperText: validationErrors?.lastName,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              lastName: undefined,
            }),
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        muiEditTextFieldProps: {
          type: "email",
          variant: "outlined",
          required: true,
          error: !!validationErrors?.email,
          helperText: validationErrors?.email,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              email: undefined,
            }),
        },
      },
      {
        accessorKey: "phone",
        header: "Phone",
        muiEditTextFieldProps: {
          type: "text",
          required: false,
          variant: "outlined",
          error: !!validationErrors?.phone,
          helperText: validationErrors?.phone,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              phone: undefined,
            }),
        },
      },
      {
        accessorKey: "roles",
        header: "Roles",
        // Custom rendering for the cell value
        Cell: ({ cell }) => (
          <span>{(cell.getValue() as string[]).join(", ")}</span>
        ),
        // Custom component for editing
        Edit: ({ cell, row, table }) => {
          //const { onBlur, onChange, value } = cell; // 'value' will be an array
          const [roles, setRoles] = useState<string[]>(
            cell.getValue() as string[],
          );

          const rowId: number = row.getValue("id");

          return (
            <FormControl fullWidth required={false}>
              <InputLabel id="roles-label">{"Roles"}</InputLabel>

              <Select
                multiple={true}
                value={roles || []} // Default to empty array if value is null/undefined
                onChange={(event) => {
                  const newRoles = event.target.value as string[];
                  console.log("New value=", newRoles);
                  // MUI Select with multiple={true} returns an array of values directly
                  setRoles(newRoles);
                  row._valuesCache["roles"] = newRoles;
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
                    <Checkbox checked={roles.includes(role)} />
                    <ListItemText primary={role} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        },
      },
    ];
  }
}

const UserTable: UserTableClass = new UserTableClass();

export default UserTable;
