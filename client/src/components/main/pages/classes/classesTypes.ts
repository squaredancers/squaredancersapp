export interface RegistrantType {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  paymentType: "session" | "perClass";
  howWillPaymentBeMade: "etransfer" | "cash" | "creditcard";
  paidSession: boolean;
  confirmationSent: boolean;
}
export interface ClassesServerType {
  id: number;
  name: string;
  classInfo: { id: number; name: string } | number;
  active: boolean;
  googleFormsName: string;
  mailChimpName: string;
  mailChimpClassType: string;
  registrants: RegistrantType[];
}

export interface ClassesTableType {
  id: number;
  name: string;
  classInfoName: string;
  classInfoId: number;
  active: boolean;
  googleFormsName: string;
  mailChimpName: string;
  mailChimpClassType: string;
  registrants: RegistrantType[];
}
