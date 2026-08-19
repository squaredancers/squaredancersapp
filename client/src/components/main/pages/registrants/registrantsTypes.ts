export interface RegistrantServerType {
  id: number;
  user: { id: number; firstName: string; lastName: string } | number;
  class: { id: number; name: string; active: boolean } | number;
  paymentType: "session" | "perClass";
  paidSession: boolean;
  dateRegistered: Date;
}

export interface RegistrantTableType {
  id: number;
  userName: string;
  userId: number;
  paymentType: "session" | "perClass";
  paidSession: boolean;
  className: string;
  classActive: boolean;
  classId: number;
  dateRegistered: Date;
}
