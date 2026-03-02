export enum DaysType {
  "Monday" = "Monday",
  "Tuesday" = "Tuesday",
  "Wednesday" = "Wednesday",
  "Thursday" = "Thursday",
  "Friday" = "Friday",
  "Saturday" = "Saturday",
  "Sunday" = "Sunday",
}

export interface ClassInfoServerType {
  id: number;
  name: string;
  day: DaysType;
  hours: number;
  location: { id: number; name: string } | number;
  caller:
    | {
        id: number;
        hourlyRate?: number;
        user: { id: number; firstName: string; lastName: string };
      }
    | number;
}

export interface ClassInfoTableType {
  id: number;
  name: string;
  day: DaysType;
  hours: string;
  callerId: number;
  callerName: string;
  locationId: number;
  locationName: string;
  hourlyRate?: number;
}
