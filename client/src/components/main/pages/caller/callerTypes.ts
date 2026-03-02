export interface CallerServerType {
  id: number;
  user: { id: number; firstName: string; lastName: string } | number;
  hourlyRate: number;
  active: boolean;
}

export interface CallerTableType {
  firstName: string;
  lastName: string;
  userId: number;
  hourlyRate: string;
  active: boolean;
  id: number;
}
