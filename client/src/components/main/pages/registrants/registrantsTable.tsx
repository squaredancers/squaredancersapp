import CheckIcon from "@mui/icons-material/Check";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import MailIcon from "@mui/icons-material/Mail";
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
  Tooltip,
} from "@mui/material";
import {
  MRT_Row,
  MRT_TableInstance,
  // createRow,
  type MRT_ColumnDef,
} from "material-react-table";
import { useEffect, useState } from "react";
import useBulkUpdateConfDialogStore from "../../../../stores/useBulkUpdateConfDialog.js";
import useCsvDialogStore from "../../../../stores/useCvsDialogStore.js";
import useFormColumnMapDialogStore from "../../../../stores/useFormColumnMapDialogStore.js";
import useMailchimpDialogStore from "../../../../stores/useMailchimpDialogStore.js";
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

// A map of row data name to the mailchimp name
const mailChimpMap: [keyof RegistrantTableType, string][] = [
  ["userFirstName", "First Name"],
  ["userLastName", "Last Name"],
  ["userEmail", "Email Address"],
  ["classMailChimpName", "RegClass"],
  ["classMailChimpClassType", "Class"],
  ["paidSession", "ClassPaid"],
  ["howWillPaymentBeMade", "PaymentKind"],
  ["paymentType", "PaymentType"],
  ["confirmationSent", "ConfirmationSent"],
];

const convertRowsToCsv = (rows: MRT_Row<RegistrantTableType>[]): string => {
  const csvRows: string[] = [];

  // First row with headers
  const headerRow: string[] = mailChimpMap.map((entry) => entry[1]);

  csvRows.push(headerRow.join(","));

  rows.forEach((row) => {
    const originalRow = row.original;
    const columnData = mailChimpMap.map((entry) => originalRow[entry[0]]);
    const line = columnData.join(",");

    console.log("Line=", line);
    csvRows.push(line);
  });

  const result = csvRows.join("\n");

  console.log("Result=", result);
  return result;
};

const MailchimpExportButton = (props: {
  rows: MRT_Row<RegistrantTableType>[];
}) => {
  const setOpen = useMailchimpDialogStore((state) => state.setOpen);
  const setContent = useMailchimpDialogStore((state) => state.setFileContent);

  return (
    <Tooltip title="Export data for Mailchimp">
      <IconButton
        onClick={() => {
          setContent(convertRowsToCsv(props.rows));
          setOpen(true);
        }}
      >
        <MailIcon />
      </IconButton>
    </Tooltip>
  );
};

const CustomImportButton = (props: { refreshTable: () => Promise<void> }) => {
  const setOpen = useCsvDialogStore((state) => state.setOpen);
  const setCallAfterSave = useCsvDialogStore((state) => state.setCallAfterSave);

  return (
    <Tooltip title="Import from google forms">
      <IconButton
        onClick={() => {
          setCallAfterSave(props.refreshTable);
          setOpen(true);
        }}
      >
        <ImportExportIcon />
      </IconButton>
    </Tooltip>
  );
};

const CustomBulkUpdateButton = (props: {
  refreshTable: () => Promise<void>;
  rows: MRT_Row<RegistrantTableType>[];
}) => {
  const setOpen = useBulkUpdateConfDialogStore((state) => state.setOpen);
  const setIds = useBulkUpdateConfDialogStore((state) => state.setIds);
  const setCallAfterSave = useBulkUpdateConfDialogStore(
    (state) => state.setCallAfterSave,
  );
  const ids: number[] = props.rows.map((row) => row.original.id);

  return (
    <Tooltip title="Bulk update of confirmation sent">
      <IconButton
        onClick={() => {
          setIds(ids);
          setCallAfterSave(props.refreshTable);
          setOpen(true);
        }}
      >
        <CheckIcon />
      </IconButton>
    </Tooltip>
  );
};

const CustomGearButton = () => {
  const openDialog = useFormColumnMapDialogStore((state) => state.openDialog);

  return (
    <Tooltip title="Define google forms mappings">
      <IconButton
        onClick={() => {
          console.log("Click gear");
          openDialog();
        }}
      >
        <SettingsIcon />
      </IconButton>
    </Tooltip>
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
      const { mutateAsync: refreshRows } = this.useCustomAction();
      const rows = table.getPrePaginationRowModel().rows;

      return (
        <>
          <CustomImportButton refreshTable={refreshRows} />
          <MailchimpExportButton rows={rows} />
          <CustomBulkUpdateButton refreshTable={refreshRows} rows={rows} />
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
      userFirstName: "",
      userLastName: "",
      userEmail: "",
      userId: 0,
      paymentType: "session",
      paidSession: false,
      className: "",
      classActive: true,
      classId: 0,
      dateRegistered: new Date(),
      howWillPaymentBeMade: "etransfer",
      classMailChimpName: "",
      confirmationSent: false,
      classMailChimpClassType: "",
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
        accessorKey: "howWillPaymentBeMade",
        header: "Payment kind",
        Cell: ({ cell }) => {
          const value = cell.getValue<"cash" | "creditcard" | "etransfer">();
          const text = {
            cash: "Cash",
            creditcard: "Credit card",
            etransfer: "E-transfer",
          };

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
        accessorKey: "confirmationSent",
        header: "Confirmation sent",
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

            <FormControl fullWidth required={true} sx={{ marginTop: 2 }}>
              <InputLabel id="classes-label">Payment kind</InputLabel>
              <Select
                multiple={false}
                value={values?.howWillPaymentBeMade}
                labelId="payment-kind-label"
                error={!!validationErrors?.howWillPaymentBeMade}
                input={<OutlinedInput label="Payment kind" />} // This prop handles the outlined input style and notches the border correctly
                onChange={(event) => {
                  const howWillPaymentBeMade = event.target.value;

                  setValues({
                    ...values!,
                    howWillPaymentBeMade,
                  });
                }}
              >
                <MenuItem key="etransfer-payment" value="etransfer">
                  <ListItemText primary="E-Transfer" />
                </MenuItem>
                <MenuItem key="cash-payment" value="cash">
                  <ListItemText primary="Cash or Cheque" />
                </MenuItem>
                <MenuItem key="creditcard-payment" value="creditcard">
                  <ListItemText primary="Credit card" />
                </MenuItem>
              </Select>
              <Conditional condition={!!validationErrors?.howWillPaymentBeMade}>
                <FormHelperText error>
                  {validationErrors?.howWillPaymentBeMade}
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
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values?.confirmationSent}
                    onChange={(event) => {
                      setValues({
                        ...values!,
                        confirmationSent: event.target.checked,
                      });
                    }}
                    color="primary"
                  />
                }
                label="Confirmation sent?"
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
