export interface UserServerType {
  firstName: string;
  lastName: string;
  phone: string;
  id: number;
  email: string;
  password?: string;
  roles: string | null;
}

export interface UserTableType {
  firstName: string;
  lastName: string;
  phone: string;
  id: number;
  email: string;
  password: string;
  roles: string[];
}
