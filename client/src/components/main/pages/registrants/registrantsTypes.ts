export interface RegistrantServerType {
  id: number;
  user:
    | { id: number; firstName: string; lastName: string; email: string }
    | number;
  class:
    | {
        id: number;
        name: string;
        active: boolean;
        mailChimpName: string;
        mailChimpClassType: string;
      }
    | number;
  paymentType: "session" | "perClass";
  paidSession: boolean;
  confirmationSent: boolean;
  dateRegistered: Date;
  howWillPaymentBeMade: "cash" | "etransfer" | "creditcard";
}

export interface RegistrantTableType {
  id: number;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userName: string;
  userId: number;
  paymentType: "session" | "perClass";
  paidSession: boolean;
  className: string;
  classActive: boolean;
  classId: number;
  classMailChimpName: string;
  classMailChimpClassType: string;
  dateRegistered: Date;
  howWillPaymentBeMade: "cash" | "etransfer" | "creditcard";
  confirmationSent: boolean;
}
