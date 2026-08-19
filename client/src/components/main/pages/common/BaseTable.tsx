import styled from "@emotion/styled";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  MRT_EditActionButtons,
  MRT_ShowHideColumnsButton,
  MRT_TableInstance,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  MaterialReactTable,
  createRow,
  useMaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import { useCallback, useMemo, useState } from "react";
import useValidationStore from "../../../../stores/useValidationStore.js";
import StringUtils from "../../../../utils/stringUtils.js";
import ConfirmationDialog from "../../../common/ConfirmationDialog.js";
import BaseServer from "./baseServer.js";
import { exportToPdf } from "./pdfUtils.js";
import IDField from "./types.js";

const queryClient = new QueryClient();

const LeftAlignButtons = styled.div`
  display: flex;
  justify-content: start;
`;
export abstract class BaseTable<
  RowTableType extends IDField,
  RowServerType extends IDField,
  ServerType extends BaseServer<RowTableType, RowServerType>,
> {
  queryKey: string;
  server: ServerType;
  rowName: string;
  isUseCustomEditDialog: boolean;

  public constructor(
    queryKey: string,
    server: ServerType,
    rowName: string,
    isUseCustomEditDialog = false,
  ) {
    this.queryKey = queryKey;
    this.server = server;
    this.rowName = rowName;
    this.isUseCustomEditDialog = isUseCustomEditDialog;
  }

  public MainTableComponent = (props: {}) => {
    const InternalTableComponent = this.TableComponent;

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <QueryClientProvider client={queryClient}>
          <InternalTableComponent />
        </QueryClientProvider>
      </LocalizationProvider>
    );
  };

  public abstract validateRow(
    row: RowTableType,
  ): Record<string, string | undefined>;

  // The default create row values can be set here if needed.
  defaultCreateRow = (): RowTableType | null => {
    return null;
  };

  public abstract getColumns(): MRT_ColumnDef<RowTableType>[];

  public getToolbarActions(
    table: MRT_TableInstance<RowTableType>,
  ): React.FC | null {
    return null;
  }

  public getCustomEditDialog(
    table: MRT_TableInstance<RowTableType>,
  ): React.FC | null {
    return null;
  }

  public getLeftToolBarActions(
    table: MRT_TableInstance<RowTableType>,
  ): React.FC | null {
    return null;
  }

  public getColumnVisibility(): { [id: string]: boolean } | undefined {
    return undefined;
  }

  TableComponent = (props: {}) => {
    const capitalRowName = StringUtils.capitalizeFirstLetter(this.rowName);
    const validationErrors = useValidationStore(
      (state) => state.validationErrors,
    );
    const setValidationErrors = useValidationStore(
      (state) => state.setValidationErrors,
    );

    // Setting the row to a non null value will open a delete confirmation dialog
    const [rowToDelete, setRowToDelete] = useState<RowTableType | null>(null);
    const columns = useMemo<MRT_ColumnDef<RowTableType>[]>(() => {
      return this.getColumns();
    }, [validationErrors]);

    //call CREATE hook
    const { mutateAsync: createRowType, isPending: isCreatingRowType } =
      this.useCreateRowType();

    //call READ hook
    const {
      data: fetchedRowType = [],
      isError: isLoadingRowTypeError,
      isFetching: isFetchingRowTypes,
      isLoading: isLoadingRowTypes,
    } = this.useGetRowType();

    //call UPDATE hook
    const { mutateAsync: updateRowType, isPending: isUpdatingRowType } =
      this.useUpdateRowType();

    //call DELETE hook
    const { mutateAsync: deleteRowType, isPending: isDeletingRowType } =
      this.useDeleteRowType();

    //CREATE action
    const handleCreateRow: MRT_TableOptions<RowTableType>["onCreatingRowSave"] =
      async ({ values, table }: { values: any; table: any }) => {
        const newValidationErrors = this.validateRow(values);

        if (Object.values(newValidationErrors).some((error) => error)) {
          setValidationErrors(newValidationErrors);
          return;
        }
        setValidationErrors({});
        await createRowType(values);
        table.setCreatingRow(null); //exit creating mode
      };

    //UPDATE action
    const handleSaveRow: MRT_TableOptions<RowTableType>["onEditingRowSave"] =
      async ({ values, table }: { values: any; table: any }) => {
        const newValidationErrors = this.validateRow(values);

        if (Object.values(newValidationErrors).some((error) => error)) {
          try {
            setValidationErrors(newValidationErrors);
          } catch (exc) {
            console.log(exc);
          }
          return;
        }
        setValidationErrors({});
        await updateRowType(values);
        table.setEditingRow(null); //exit editing mode
      };

    //DELETE action
    const openDeleteConfirmModal = (row: MRT_Row<RowTableType>) => {
      setRowToDelete(row.original);
    };

    const table = useMaterialReactTable({
      columns,
      data: fetchedRowType,
      createDisplayMode: this.isUseCustomEditDialog ? "custom" : "modal", //default ('row', and 'custom' are also available)
      editDisplayMode: this.isUseCustomEditDialog ? "custom" : "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
      enableEditing: true,
      enableRowActions: true,
      initialState: {
        columnVisibility: this.getColumnVisibility(),
      },
      muiEditRowDialogProps: ({ table, row }) => ({
        open: !!table.getState().editingRow, // Ensure this is present
        onClose: () => table.setEditingRow(null),
        PaperProps: {
          sx: {
            // Targets the main dialog content area padding
            "& .MuiDialogContent-root": {
              marginTop: "32px",
            },
            // Alternatively, adjust the overall dialog paper padding/margin
            marginTop: "16px",
          },
        },
      }),
      getRowId: (row) => `${row.id}`,
      muiToolbarAlertBannerProps: isLoadingRowTypeError
        ? {
            color: "error",
            children: "Error loading data",
          }
        : undefined,
      muiTableContainerProps: {
        sx: {
          minHeight: "300px",
        },
      },
      onCreatingRowCancel: () => setValidationErrors({}),
      onCreatingRowSave: handleCreateRow,
      onEditingRowCancel: () => setValidationErrors({}),
      onEditingRowSave: handleSaveRow,
      //optionally customize modal content
      renderCreateRowDialogContent: ({
        table,
        row,
        internalEditComponents,
      }) => (
        <>
          <DialogTitle variant="h3">{`Create New ${capitalRowName}`}</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {internalEditComponents}{" "}
            {/* or render custom edit components here */}
          </DialogContent>
          <DialogActions>
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </DialogActions>
        </>
      ),
      //optionally customize modal content
      renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
        <>
          <DialogTitle variant="h3">{`Edit ${capitalRowName}`}</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {internalEditComponents}{" "}
            {/* or render custom edit components here */}
          </DialogContent>
          <DialogActions>
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </DialogActions>
        </>
      ),

      renderRowActions: ({ row, table }) => (
        <Box sx={{ display: "flex", gap: "1rem" }}>
          <Tooltip title="Edit">
            <IconButton onClick={() => table.setEditingRow(row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={() => openDeleteConfirmModal(row)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),

      renderTopToolbarCustomActions: ({ table }) => {
        const CustomActions = useMemo(() => {
          return this.getLeftToolBarActions(table);
        }, [table]);
        return (
          <LeftAlignButtons>
            <Button
              variant="contained"
              onClick={() => {
                const defaultRow = this.defaultCreateRow();

                if (defaultRow === null) {
                  table.setCreatingRow(true);
                } else {
                  table.setCreatingRow(createRow(table, defaultRow));
                }
              }}
            >
              {`Create New ${capitalRowName}`}
            </Button>
            {CustomActions ? <CustomActions /> : null}
          </LeftAlignButtons>
        );
      },

      renderToolbarInternalActions: ({ table }) => {
        const CustomToolBarActions = useMemo(() => {
          return this.getToolbarActions(table);
        }, [table]);

        return (
          <>
            {/* Add your own custom button */}

            <MRT_ToggleGlobalFilterButton table={table} />
            {CustomToolBarActions ? <CustomToolBarActions /> : null}
            {/* Built-in buttons (must pass in the table prop) */}
            <IconButton
              onClick={() => {
                const rows = table.getFilteredRowModel().rows.map((row) => {
                  return columns.map((col) => {
                    const colKey: string = col.accessorKey ?? "";
                    let value = row.original[colKey];

                    if (Array.isArray(value)) {
                      value = value.join(",");
                    }

                    return value as string;
                  });
                });

                exportToPdf(
                  columns as { header: string; accessorKey: string }[],
                  rows,
                );
              }}
            >
              <PictureAsPdfIcon />
            </IconButton>
            <MRT_ToggleDensePaddingButton table={table} />
            <MRT_ToggleFiltersButton table={table} />
            <MRT_ShowHideColumnsButton table={table} />
            <MRT_ToggleFullScreenButton table={table} />
          </>
        );
      },
      state: {
        isLoading: isLoadingRowTypes,
        isSaving: isCreatingRowType || isUpdatingRowType || isDeletingRowType,
        showAlertBanner: isLoadingRowTypeError,
        showProgressBars: isFetchingRowTypes,
      },
    });

    const closeDialog = useCallback(
      async (okPressed: boolean) => {
        if (okPressed) {
          await deleteRowType(rowToDelete!);
        }

        setRowToDelete(null);
      },
      [rowToDelete],
    );

    const CustomEditDialog = useMemo(() => {
      return this.getCustomEditDialog(table);
    }, [table]);

    return (
      <>
        <MaterialReactTable table={table} />
        <ConfirmationDialog
          open={rowToDelete !== null}
          closeDialog={closeDialog}
          title={`Delete ${this.rowName}?`}
          description={`About to delete a ${this.rowName} row.  Do you want to continue with this deletion?`}
        />
        {CustomEditDialog ? <CustomEditDialog /> : null}
      </>
    );
  };

  //CREATE hook (post new row to api)
  useCreateRowType() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (row: RowTableType) => {
        try {
          await this.server.createRow(row);
        } catch (exc) {
          console.log(exc);
        }
      },

      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: [this.queryKey] }), //refetch row after mutation
    });
  }

  //READ hook (get rows from api)
  useGetRowType() {
    return useQuery<RowTableType[]>({
      queryKey: [this.queryKey],
      queryFn: async () => {
        return await this.server.getRows();
      },
      refetchOnWindowFocus: false,
    });
  }

  //UPDATE hook (put row in api)
  useUpdateRowType() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (row: RowTableType) => {
        await this.server.updateRow(row);
      },

      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: [this.queryKey] }), //refetch rows after mutation
    });
  }

  //DELETE hook (delete row in api)
  useDeleteRowType() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (row: RowTableType) => {
        await this.server.deleteRow(row);
      },

      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: [this.queryKey] }), //refetch rows after mutation
    });
  }

  // Execute a custom action
  useCustomAction() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async () => {
        // Do nothing.  We just want to get all the rows refetched.
      },

      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: [this.queryKey] }), //refetch rows after mutation
    });
  }
}
