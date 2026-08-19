import ImportExportIcon from "@mui/icons-material/ImportExport";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Button,
  Checkbox,
  Chip,
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
} from "@mui/material";
import {
  MRT_TableInstance,
  // createRow,
  type MRT_ColumnDef,
} from "material-react-table";
import { useEffect, useState } from "react";
import useCsvDialogStore from "../../../../stores/useCvsDialogStore.js";
import useFormColumnMapDialogStore from "../../../../stores/useFormColumnMapDialogStore.js";
import useValidationStore from "../../../../stores/useValidationStore.js";
import Conditional from "../../../common/Conditional.js";
import { ClassesServerTypeClass } from "../classes/ClassesTable.js";
import { ClassesTableType } from "../classes/classesTypes.js";
import { BaseTable } from "../common/BaseTable.js";
import ValidationUtils from "../common/validationUtils.js";
import { UserServerTypeClass } from "../user/UsersTable.js";
import { UserTableType } from "../user/userTypes.js";
import { RegistrantServerTypeClass } from "./RegistrantServerTypeClass.js";
import {
  RegistrantServerType,
  RegistrantTableType,
} from "./registrantsTypes.js";

const CustomImportButton = () => {
  const setOpen = useCsvDialogStore((state) => state.setOpen);

  return (
    <IconButton onClick={() => setOpen(true)}>
      <ImportExportIcon />
    </IconButton>
  );
};

const CustomGearButton = () => {
  const openDialog = useFormColumnMapDialogStore((state) => state.openDialog);

  return (
    <IconButton
      onClick={() => {
        console.log("Click gear");
        openDialog();
      }}
    >
      <SettingsIcon />
    </IconButton>
  );
};

class RegistrantTableClass extends BaseTable<
  RegistrantTableType,
  RegistrantServerType,
  RegistrantServerTypeClass
> {
  public constructor() {
    super("registrant", new RegistrantServerTypeClass(), "registrant", true);
  }

  public getToolbarActions(
    table: MRT_TableInstance<RegistrantTableType>,
  ): React.FC | null {
    return () => {
      return (
        <>
          <CustomImportButton />
          <CustomGearButton />
        </>
      );
    };
  }

  MainRegistrantTableComponent = () => {
    const MainTableComponent = this.MainTableComponent;

    return <MainTableComponent />;
  };

  public validateRow(
    registrant: RegistrantTableType,
  ): Record<string, string | undefined> {
    return {
      userName: !ValidationUtils.validateRequired(registrant?.userName)
        ? "Caller name is required."
        : "",
      className: !ValidationUtils.validateRequired(registrant?.className)
        ? "Location is required."
        : "",
    };
  }

  defaultCreateRow = (): RegistrantTableType | null => {
    return {
      id: 1,
      userName: "",
      userId: 0,
      paymentType: "session",
      paidSession: false,
      className: "",
      classActive: true,
      classId: 0,
      dateRegistered: new Date(),
    };
  };

  public getColumnVisibility(): { [id: string]: boolean } | undefined {
    return { id: false, classId: false, classActive: false };
  }

  public getColumns(): MRT_ColumnDef<RegistrantTableType, unknown>[] {
    return [
      {
        accessorKey: "userName",
        header: "Student name",
        enableEditing: false,
      },
      {
        accessorKey: "className",
        header: "Class name",
        enableEditing: false,
      },
      {
        accessorKey: "paymentType",
        header: "Payment type",
        Cell: ({ cell }) => {
          const value = cell.getValue<"session" | "perClass">();
          const text = { session: "Session", perClass: "Pay per class" };

          return <Chip label={text[value]} size="small" />;
        },
      },
      {
        accessorKey: "paidSession",
        header: "Paid session",
        Cell: ({ cell }) => {
          const value = cell.getValue<boolean>();

          return <Chip label={value ? "True" : "False"} size="small" />;
        },
      },
      {
        accessorKey: "id",
        header: "id",
        enableEditing: false,
        visibleInShowHideMenu: false,
        enableHiding: false,
      },
      {
        accessorKey: "classId",
        header: "Class Id",
        enableEditing: false,
        visibleInShowHideMenu: false,
        enableHiding: false,
      },
      {
        accessorKey: "classActive",
        header: "Class active",
        enableEditing: false,
        visibleInShowHideMenu: false,
        enableHiding: false,
      },
    ];
  }

  public getCustomEditDialog(
    table: MRT_TableInstance<RegistrantTableType>,
  ): React.FC | null {
    const CustomEditForm = () => {
      const { editingRow, creatingRow } = table.getState();
      const isCreateOrEdit = editingRow !== null || creatingRow !== null;
      const prevValues = editingRow
        ? editingRow.original
        : creatingRow
          ? creatingRow.original
          : null;
      const [values, setValues] = useState<RegistrantTableType | null>(null);
      const [users, setUsers] = useState<UserTableType[]>([]);
      const [classes, setClasses] = useState<ClassesTableType[]>([]);
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
        const classesServer = new ClassesServerTypeClass();

        const getUsers = async () => {
          const users: UserTableType[] = await userServer.getRows();
          const classes: ClassesTableType[] = await classesServer.getRows();

          setUsers(users);
          setClasses(classes);

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

      if (!isCreateOrEdit) return null; // Don't render if no row is being edited

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
              <InputLabel id="student-label">Student</InputLabel>
              <Select
                multiple={false}
                value={values?.userId}
                required={true}
                error={!!validationErrors?.userName}
                labelId="user-label"
                input={<OutlinedInput label="Student" />} // This prop handles the outlined input style and notches the border correctly
                onFocus={() =>
                  setValidationErrors({
                    ...validationErrors,
                    userName: undefined,
                  })
                }
                onChange={(event) => {
                  const userId = event.target.value;
                  const user = users.find((user) => user.id === userId);

                  setValues({
                    ...values!,
                    userId,
                    userName: `${user?.firstName} ${user?.lastName}`,
                  });
                }}
              >
                {users.map((user) => {
                  const userName = `${user?.firstName} ${user?.lastName}`;

                  return (
                    <MenuItem key={userName} value={user.id}>
                      <ListItemText primary={userName} />
                    </MenuItem>
                  );
                })}
              </Select>
              <Conditional condition={!!validationErrors?.userName}>
                <FormHelperText error>
                  {validationErrors?.userName}
                </FormHelperText>
              </Conditional>
            </FormControl>

            <FormControl fullWidth required={true} sx={{ marginTop: 2 }}>
              <InputLabel id="classes-label">Classes</InputLabel>
              <Select
                multiple={false}
                value={values?.classId}
                labelId="classes-label"
                error={!!validationErrors?.className}
                input={<OutlinedInput label="Classes" />} // This prop handles the outlined input style and notches the border correctly
                onChange={(event) => {
                  const classId = event.target.value;
                  const clazz = classes.find((clazz) => clazz.id === classId);

                  setValues({
                    ...values!,
                    classId,
                    classActive: clazz?.active ?? true,
                    className: clazz?.name ?? "",
                  });
                }}
              >
                {classes.map((clazz) => {
                  return (
                    <MenuItem key={clazz.name} value={clazz.id}>
                      <ListItemText primary={clazz.name} />
                    </MenuItem>
                  );
                })}
              </Select>
              <Conditional condition={!!validationErrors?.className}>
                <FormHelperText error>
                  {validationErrors?.className}
                </FormHelperText>
              </Conditional>
            </FormControl>

            <FormControl fullWidth required={true} sx={{ marginTop: 2 }}>
              <InputLabel id="classes-label">Payment type</InputLabel>
              <Select
                multiple={false}
                value={values?.paymentType}
                labelId="payment-type-label"
                error={!!validationErrors?.paymentType}
                input={<OutlinedInput label="Payment type" />} // This prop handles the outlined input style and notches the border correctly
                onChange={(event) => {
                  const paymentType = event.target.value;

                  setValues({
                    ...values!,
                    paymentType,
                  });
                }}
              >
                <MenuItem key="session-payment" value="session">
                  <ListItemText primary="Session" />
                </MenuItem>
                <MenuItem key="pay-per-class" value="perClass">
                  <ListItemText primary="Pay per class" />
                </MenuItem>
              </Select>
              <Conditional condition={!!validationErrors?.paymentType}>
                <FormHelperText error>
                  {validationErrors?.paymentType}
                </FormHelperText>
              </Conditional>
            </FormControl>

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values?.paidSession}
                    onChange={(event) => {
                      setValues({
                        ...values!,
                        paidSession: event.target.checked,
                      });
                    }}
                    color="primary"
                  />
                }
                label="Session paid?"
              />
            </FormGroup>

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

const RegistrantTable: RegistrantTableClass = new RegistrantTableClass();

export default RegistrantTable;
