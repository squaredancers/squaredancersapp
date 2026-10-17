export interface UserServerType {
  firstName: string;
  lastName: string;
  phone: string;
  id: number;
  email: string;
  password?: string;
  roles: string | null;
  active: boolean;
}

export interface UserTableType {
  firstName: string;
  lastName: string;
  phone: string;
  id: number;
  email: string;
  password: string;
  roles: string[];
  active: boolean;
}

export const sortByName = (users: UserTableType[]) => {
  users.sort((a, b) => {
    const aName = `${a.firstName.trim()} ${a.lastName.trim()}`.toLowerCase();
    const bName = `${b.firstName.trim()} ${b.lastName.trim()}`.toLowerCase();

    return aName.localeCompare(bName);
  });
};
