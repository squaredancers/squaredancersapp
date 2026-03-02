import { wrap } from "@mikro-orm/core";
import { FastifyInstance } from "fastify";
import z from "zod";
import { initORM } from "../../db.js";
import { verifyRole } from "../common/roleUtils.js";
import { RolesType } from "../role/roleType.js";
import { Location } from "./location.entity.js";

const locationSchema = z.object({
  name: z.string().nonoptional(),
  address: z.string().nonoptional(),
  phone: z.string(),
  rent: z.number(),
});

export const registerLocationRoutes = async (app: FastifyInstance) => {
  const db = await initORM();

  // Get location for the specified id
  app.get("/:id?", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, [RolesType.AdminViewer]);
    let result: Location | Location[] | null = null;

    const params = request.params as { id: string };

    if (params.id) {
      result = await db.location.findOneOrFail(+params.id);
    } else {
      result = await db.location.findAll();
    }

    return result;
  });

  app.post("/", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const locationObject = locationSchema.parse(request.body);
    const newLocation: Location = db.location.create(locationObject);

    await db.em.flush();
    return { success: true, newLocation };
  });

  // Update the user record for the dues Id specified
  app.patch("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const locationObject = locationSchema.parse(request.body);
    const locationRecord = await db.location.findOneOrFail(+params.id);

    wrap(locationRecord).assign(locationObject);

    await db.em.flush();
    return { success: true, newLocation: locationRecord };
  });

  app.delete("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const locationRecord = await db.location.findOneOrFail(+params.id);

    await db.em.remove(locationRecord).flush();
    return { success: true };
  });
};
