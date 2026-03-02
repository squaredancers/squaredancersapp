import {
  // createRow,
  type MRT_ColumnDef,
} from "material-react-table";
import useValidationStore from "../../../../stores/useValidationStore.js";
import BaseServer from "../common/baseServer.js";
import { BaseTable } from "../common/BaseTable.js";
import ValidationUtils from "../common/validationUtils.js";
import { LocationServerType, LocationTableType } from "./locationTypes.js";

export class LocationServerTypeClass extends BaseServer<
  LocationTableType,
  LocationServerType
> {
  public constructor() {
    super("location");
  }

  public mapTableToServer(location: LocationTableType): LocationServerType {
    const { id, name, address, phone } = location;
    const rent = Math.trunc(parseFloat(location.rent) * 100);

    return {
      id,
      name,
      address,
      phone,
      rent,
    };
  }

  public mapServerToTable(location: LocationServerType): LocationTableType {
    const { id, name, address, phone } = location;
    const rent = (location.rent / 100).toFixed(2);

    return {
      id,
      name,
      address,
      phone,
      rent,
    };
  }
}

class LocationTableClass extends BaseTable<
  LocationTableType,
  LocationServerType,
  LocationServerTypeClass
> {
  public constructor() {
    super("location", new LocationServerTypeClass(), "location");
  }

  MainLocationTableComponent = () => {
    const MainTableComponent = this.MainTableComponent;

    return <MainTableComponent />;
  };

  public validateRow(
    location: LocationTableType,
  ): Record<string, string | undefined> {
    const result = {
      name: !ValidationUtils.validateRequired(location.name)
        ? "Name is Required"
        : "",
      rent: !ValidationUtils.validateNumeric(location.rent)
        ? "Rent must be numeric"
        : "",
    };

    return result;
  }

  defaultCreateRow = (): LocationTableType | null => {
    return { id: 1, name: "", address: "", phone: "", rent: "0.00" };
  };

  public getColumns(): MRT_ColumnDef<LocationTableType, unknown>[] {
    const validationErrors = useValidationStore.getState().validationErrors;
    const setValidationErrors =
      useValidationStore.getState().setValidationErrors;

    return [
      {
        accessorKey: "name",
        header: "Name",
        muiEditTextFieldProps: {
          required: true,
          variant: "outlined",
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              name: undefined,
            }),
        },
      },
      {
        accessorKey: "address",
        header: "Address",
        muiEditTextFieldProps: {
          required: false,
          variant: "outlined",
        },
      },
      {
        accessorKey: "phone",
        header: "Phone",
        muiEditTextFieldProps: {
          required: false,
          variant: "outlined",
        },
      },
      {
        accessorKey: "rent",
        header: "Rent",
        muiEditTextFieldProps: {
          type: "text",
          required: true,
          variant: "outlined",
          error: !!validationErrors?.rent,
          helperText: validationErrors?.rent,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              rent: undefined,
            }),
        },
      },
    ];
  }
}

const LocationTable: LocationTableClass = new LocationTableClass();

export default LocationTable;
