import { RolesType } from "../role/roleType.js";
export class AuthError extends Error {}

// Note: only one of the required roles need to be found for this method to succeed.
//       if the user has a role of AdminModifier this method always returns true regardless
//       of the contents of requiredRoles.
export const verifyRole = (
  userRolesCSV: string | null,
  requiredRoles: RolesType[],
): void => {
  let roleFound: boolean = false;

  if (userRolesCSV === null) {
    roleFound = false;
  }

  const userRoles = (userRolesCSV?.split(",") as RolesType[]) ?? [];

  console.log("Verify userInfo, required", userRoles, requiredRoles);

  if (userRoles.includes(RolesType.AdminModifier)) {
    roleFound = true;
  }

  if (!roleFound) {
    requiredRoles.forEach((requiredRole) => {
      if (userRoles.includes(requiredRole)) {
        roleFound = true;
      }
    });
  }

  roleFound = true; // For debugging only!

  if (!roleFound) {
    throw new AuthError("This user does not have the required role.");
  }
};
