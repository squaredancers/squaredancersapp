import { PictureAsPdf } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  IconButton,
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
import { JSONTemplateState } from "../../../../stores/templateFactoryStore.js";
import useRootTemplateStore from "../../../../stores/useRootTemplateStore.js";
import useValidationStore from "../../../../stores/useValidationStore.js";
import {
  SettingsServerType,
  SettingsServerTypeClass,
  SettingsTableType,
} from "../common/settingsServer.js";

class TemplateTableClass extends BaseTable<
  SettingsTableType,
  SettingsServerType,
  SettingsServerTypeClass
> {
  public constructor() {
    super(
      "templates",
      new SettingsServerTypeClass("mapping_settings"),
      "Template",
      true,
    );
  }

  MainTemplateTableComponent = () => {
    const MainTableComponent = this.MainTableComponent;

    return <MainTableComponent />;
  };

  public validateRow(
    template: SettingsTableType,
  ): Record<string, string | undefined> {
    return {};
  }

  defaultCreateRow = (): SettingsTableType | null => {
    return {
      id: 1,
      name: "Template",
      jsonString: "{}",
    };
  };

  public getColumns(): MRT_ColumnDef<SettingsTableType, unknown>[] {
    return [
      {
        accessorKey: "name",
        header: "Name",
        enableEditing: false,
      },
    ];
  }

  public getCustomEditAction(
    row: MRT_Row<SettingsTableType>,
    refreshRows: () => void,
  ): (() => void) | null {
    const customAction = () => {
      const name = row.original.name;
      const id = row.original.id;
      const jsonString = row.original.jsonString;
      const jsonData: JSONTemplateState = JSON.parse(jsonString);

      const saveData = async (name: string, jsonString: string) => {
        await this.server.updateRow({ id, name, jsonString });
        refreshRows();
      };

      useRootTemplateStore.getState().loadState(name, jsonData, saveData);
    };

    return customAction;
  }

  public getCustomRowActions(row: MRT_Row<SettingsTableType>): React.FC | null {
    const handlePDFClick = async () => {};

    return () => (
      <Tooltip title="Show template text">
        <IconButton onClick={handlePDFClick}>
          <PictureAsPdf />
        </IconButton>
      </Tooltip>
    );
  }

  public getCustomEditDialog(
    table: MRT_TableInstance<SettingsTableType>,
  ): React.FC | null {
    const CustomEditForm = () => {
      const { editingRow, creatingRow } = table.getState();
      const isCreateOrEdit = editingRow !== null || creatingRow !== null;
      const [values, setValues] = useState<SettingsTableType | null>(null);
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
            //setValues(prevValues);
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
        if (editingRow !== null) {
          // We should never get here
          //await updateRowType(updatedValues);
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
              label="Template name"
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
                  title: undefined,
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

const TemplateTable: TemplateTableClass = new TemplateTableClass();

export default TemplateTable;
