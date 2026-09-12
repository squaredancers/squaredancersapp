import { RegistrantType } from "../classes/classesTypes.js";

export interface ClassListsServerType {
  id: number;
  title: string;
  columns: string;
  class:
    | {
        id: number;
        name: string;
      }
    | number;
}

export interface ClassListsTableType extends ClassListsServerType {
  className: string;
  classId: number;
}

export const reportFields: {
  fieldName: string;
  access: (registrant: RegistrantType) => string;
}[] = [
  {
    fieldName: "Student name",
    access: (registrant) =>
      `${registrant.user.firstName} ${registrant.user.lastName}`,
  },
  { fieldName: "Email", access: (registrant) => registrant.user.email },
  { fieldName: "Payment type", access: (registrant) => registrant.paymentType },
  {
    fieldName: "Payment kind",
    access: (registrant) => registrant.howWillPaymentBeMade,
  },
  { fieldName: "Paid", access: (registrant) => registrant.paidSession + "" },
];

export const getFieldValue = (
  columnName: string,
  registrant: RegistrantType,
) => {
  for (let index = 0; index < reportFields.length; index++) {
    const entry = reportFields[index];

    if (entry.fieldName === columnName) {
      return entry.access(registrant);
    }
  }

  return "";
};
