import { FastifyInstance } from "fastify";
import { RolesType } from "./roleType.js";

export const registerRoleRoutes = async (app: FastifyInstance) => {
  // Get all Roles
  app.get("/all", async (request) => {
    return Object.values(RolesType);
  });
};
