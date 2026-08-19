export interface ClassesServerType {
  id: number;
  name: string;
  classInfo: { id: number; name: string } | number;
  active: boolean;
  googleFormsName: string;
  mailChimpName: string;
}

export interface ClassesTableType {
  id: number;
  name: string;
  classInfoName: string;
  classInfoId: number;
  active: boolean;
  googleFormsName: string;
  mailChimpName: string;
}
