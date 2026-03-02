export interface ClassesServerType {
  id: number;
  name: string;
  classInfo: { id: number; name: string } | number;
  active: boolean;
}

export interface ClassesTableType {
  id: number;
  name: string;
  classInfoName: string;
  classInfoId: number;
  active: boolean;
}
