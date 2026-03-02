export interface EventServerType {
  id: number;
  name: string;
  date: string;
  class: { id: number; name: string } | number | null;
  location: { id: number; name: string } | number;
  caller:
    | {
        id: number;
        user: { firstName: string; lastName: string };
      }
    | number;
  draft: boolean;
  hours: number;
  roomCharge: number;
  callerCharge: number;
}

export interface EventTableType {
  id: number;
  name: string;
  date: Date;
  hours: string;
  classId: number | null;
  locationId: number;
  locationName: string;
  callerId: number;
  callerName: string;
  draft: boolean;
  roomCharge: string;
  callerCharge: string;
}
