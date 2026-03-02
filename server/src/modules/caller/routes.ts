import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { initORM } from "../../db.js";
import { wrap, Loaded, QueryOrder } from "@mikro-orm/core";
import { Caller } from "./caller.entity.js";
import { RolesType } from "../role/roleType.js";
import { verifyRole } from "../common/roleUtils.js";
import z from "zod";

const callerSchema = z.object({
  user: z.number().nonoptional(),
  hourlyRate: z.number().nonoptional(),
  active: z.boolean().nonoptional(),
});

interface QueryParams {
  active?: boolean;
}

export const registerCallerRoutes = async (app: FastifyInstance) => {
  const db = await initORM();

  const routeOptions: RouteShorthandOptions = {
    schema: {
      querystring: {
        type: "object",
        properties: {
          active: { type: "boolean" },
        },
      },
    },
  };

  // Get callers for the specified id
  app.get<{ Querystring: QueryParams }>(
    "/:id?",
    routeOptions,
    async (request) => {
      verifyRole(request?.userInfo?.roles ?? null, [RolesType.AdminViewer]);
      let result:
        | Caller
        | Loaded<
            Caller,
            "user",
            "user.id" | "user.firstName" | "user.lastName",
            never
          >[]
        | null = null;

      const params = request.params as { id: string };
      const { active } = request.query;

      console.log("Params =", params);
      if (params.id) {
        result = await db.caller.findOneOrFail(+params.id);
      } else {
        result = await db.em.find(Caller, active ? { active: true } : {}, {
          populate: ["user"],
          orderBy: { user: { firstName: QueryOrder.DESC } },
          fields: [
            "hourlyRate",
            "active",
            "user.id",
            "user.firstName",
            "user.lastName",
          ],
        });
      }

      return result;
    },
  );

  app.post("/", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const callerObject = callerSchema.parse(request.body);
    const newCaller: Caller = db.caller.create(callerObject);

    await db.em.flush();
    return { success: true, newCaller };
  });

  app.patch("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const callerObject = callerSchema.parse(request.body);
    const callerRecord = await db.caller.findOneOrFail(+params.id);

    wrap(callerRecord).assign(callerObject);

    await db.em.flush();
    return { success: true, newCaller: callerRecord };
  });

  app.delete("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const callerRecord = await db.caller.findOneOrFail(+params.id);

    await db.em.remove(callerRecord).flush();
    return { success: true };
  });
};
