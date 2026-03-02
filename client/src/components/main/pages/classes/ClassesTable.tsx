import PrintIcon from "@mui/icons-material/PrintRounded";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
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
import { ClassInfoServerTypeClass } from "../classinfo/ClassinfoTable.js";
import { ClassInfoTableType } from "../classinfo/classInfoTypes.js";
import { BaseTable } from "../common/BaseTable.js";
import BaseServer from "../common/baseServer.js";
import ValidationUtils from "../common/validationUtils.js";
import { ClassesServerType, ClassesTableType } from "./classesTypes.js";

export class ClassesServerTypeClass extends BaseServer<
  ClassesTableType,
  ClassesServerType
> {
  public constructor() {
    super("class");
  }

  public mapTableToServer(classes: ClassesTableType): ClassesServerType {
    const { id, name, classInfoId, active } = classes;

    return {
      id,
      name,
      classInfo: classInfoId,
      active,
    };
  }

  public mapServerToTable(classes: ClassesServerType): ClassesTableType {
    const classInfo = classes.classInfo as {
      name: string;
      id: number;
    };

    return {
      id: classes.id,
      name: classes.name,
      active: classes.active,
      classInfoId: classInfo.id,
      classInfoName: classInfo.name,
    };
  }
}

class ClassesTableClass extends BaseTable<
  ClassesTableType,
  ClassesServerType,
  ClassesServerTypeClass
> {
  public constructor() {
    super("classes", new ClassesServerTypeClass(), "classes", true);
  }

  MainCallerTableComponent = () => {
    const MainTableComponent = this.MainTableComponent;

    return <MainTableComponent />;
  };

  public validateRow(
    classes: ClassesTableType,
  ): Record<string, string | undefined> {
    return {
      name: !ValidationUtils.validateRequired(classes.name)
        ? "Name is required"
        : "",
      classInfoId: classes.classInfoId === 0 ? "No class info selected" : "",
    };
  }

  public getColumns(): MRT_ColumnDef<ClassesTableType, unknown>[] {
    return [
      {
        accessorKey: "name",
        header: "Class name",
        enableEditing: false,
      },
      {
        accessorKey: "classInfoName",
        header: "ClassInfo name",
        enableEditing: false,
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

  public getToolbarActions(
    table: MRT_TableInstance<ClassesTableType>,
  ): React.FC | null {
    return () => (
      <IconButton onClick={() => alert("print pressed")}>
        <PrintIcon />
      </IconButton>
    );
  }

  public getCustomEditDialog(
    table: MRT_TableInstance<ClassesTableType>,
  ): React.FC | null {
    const CustomEditForm = () => {
      const { editingRow, creatingRow } = table.getState();
      const isCreateOrEdit = editingRow !== null || creatingRow !== null;
      const prevValues = editingRow
        ? editingRow.original
        : creatingRow
          ? creatingRow.original
          : null;
      const [values, setValues] = useState<ClassesTableType | null>(null);
      const [allClassInfo, setAllClassInfo] = useState<ClassInfoTableType[]>(
        [],
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
        const classInfoServer = new ClassInfoServerTypeClass();

        const getAllClassInfo = async () => {
          const allClassInfo: ClassInfoTableType[] =
            await classInfoServer.getRows();

          setAllClassInfo(allClassInfo);

          if (editingRow !== null) {
            // Initialize form values when an editing row is set
            setValues(prevValues);
          } else {
            setValues({
              id: 0,
              name: "",
              classInfoName: "",
              classInfoId: 0,
              active: true,
            });
          }
        };

        getAllClassInfo();
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
              label="Class name"
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

            <FormControl fullWidth required={true} sx={{ marginTop: 2 }}>
              <InputLabel id="user-label">
                {allClassInfo.length === 0
                  ? "No classinfo available"
                  : "Class info name"}
              </InputLabel>
              <Select
                disabled={allClassInfo.length === 0}
                multiple={false}
                value={values?.classInfoId ?? 1}
                labelId="classes-label"
                onFocus={() =>
                  setValidationErrors({
                    ...validationErrors,
                    classInfoId: undefined,
                  })
                }
                input={
                  <OutlinedInput
                    label={
                      allClassInfo.length === 0
                        ? "No class info available"
                        : "Class info name"
                    }
                  />
                } // This prop handles the outlined input style and notches the border correctly
                onChange={(event) => {
                  const classInfoId = event.target.value;
                  const classInfo = allClassInfo.find(
                    (classInfo) => classInfo.id === classInfoId,
                  );

                  setValues({
                    ...values!,
                    classInfoId,
                    classInfoName: classInfo?.name ?? "",
                  });
                }}
                renderValue={(classInfoId) => {
                  const { classInfoName } = useMemo(() => {
                    const classInfo =
                      creatingRow !== null && allClassInfo.length === 0
                        ? null
                        : allClassInfo.find(
                            (classInfo) => classInfo.id === classInfoId,
                          );

                    return {
                      classInfoName: classInfo?.name ?? "",
                    };
                  }, [classInfoId, creatingRow, allClassInfo]);

                  return (
                    <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {classInfoName}
                    </Box>
                  );
                }}
              >
                {allClassInfo.map((classInfo) => {
                  return (
                    <MenuItem key={classInfo.id} value={classInfo.id}>
                      <ListItemText primary={classInfo.name} />
                    </MenuItem>
                  );
                })}
              </Select>
              <Conditional condition={!!validationErrors?.classInfoId}>
                <FormHelperText error>
                  {validationErrors?.classInfoId}
                </FormHelperText>
              </Conditional>
            </FormControl>
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
                disabled={allClassInfo.length === 0 && creatingRow !== null}
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

const ClassesTable: ClassesTableClass = new ClassesTableClass();

export default ClassesTable;
