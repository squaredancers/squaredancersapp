import { Loaded, QueryOrder, wrap } from "@mikro-orm/core";
import { FastifyInstance } from "fastify";
import z from "zod";
import { initORM } from "../../db.js";
import { verifyRole } from "../common/roleUtils.js";
import { RolesType } from "../role/roleType.js";
import { ClassInfo, DaysType } from "./classInfo.entity.js";

const classInfoSchema = z.object({
  name: z.string().nonoptional(),
  location: z.number().nonoptional(),
  day: z.enum(Object.values(DaysType)).nonoptional(),
  caller: z.number().nonoptional(),
  hours: z.number().nonoptional(),
});

export const registerClassInfoRoutes = async (app: FastifyInstance) => {
  const db = await initORM();

  // Get all days
  app.get("/days", async (request) => {
    return Object.values(DaysType);
  });

  // Get classInfo for the specified id
  app.get("/:id?", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, [RolesType.AdminViewer]);
    let result:
      | ClassInfo
      | ClassInfo[]
      | Loaded<
          ClassInfo,
          "location" | "caller",
          "location.name" | "caller.user.firstName" | "caller.user.lastName",
          never
        >[]
      | Loaded<
          ClassInfo,
          "location" | "caller",
          "location.name" | "caller.user.firstName" | "caller.user.lastName",
          never
        >
      | null = null;

    const params = request.params as { id: string };

    if (params.id) {
      result = await db.classInfo.findOneOrFail(+params.id, {
        populate: ["location", "caller", "caller.user"],
        orderBy: { name: QueryOrder.DESC },
        fields: [
          "name",
          "day",
          "hours",
          "location.id",
          "location.name",
          "caller.id",
          "caller.user.firstName",
          "caller.user.lastName",
          "caller.hourlyRate",
        ],
      });
    } else {
      result = await db.em.find(
        ClassInfo,
        {},
        {
          populate: ["location", "caller", "caller.user"],
          orderBy: { name: QueryOrder.DESC },
          fields: [
            "name",
            "day",
            "hours",
            "location.id",
            "location.name",
            "caller.id",
            "caller.user.firstName",
            "caller.user.lastName",
          ],
        },
      );
    }

    return result;
  });

  app.post("/", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const classInfoObject = classInfoSchema.parse(request.body);
    const newClassInfo: ClassInfo = db.classInfo.create(classInfoObject);

    await db.em.flush();
    return { success: true, newClassInfo };
  });

  app.patch("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const classInfoObject = classInfoSchema.parse(request.body);
    const classInfoRecord = await db.classInfo.findOneOrFail(+params.id);

    wrap(classInfoRecord).assign(classInfoObject);

    await db.em.flush();
    return { success: true, newLocation: classInfoRecord };
  });

  app.delete("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const classInfoRecord = await db.classInfo.findOneOrFail(+params.id);

    await db.em.remove(classInfoRecord).flush();
    return { success: true };
  });
};
