import { Loaded, QueryOrder, wrap } from "@mikro-orm/core";
import { FastifyInstance } from "fastify";
import z from "zod";
import { initORM } from "../../db.js";
import { verifyRole } from "../common/roleUtils.js";
import { RolesType } from "../role/roleType.js";
import { Class } from "./class.entity.js";

const classSchema = z.object({
  classInfo: z.number().nonoptional(),
  name: z.string().nonoptional(),
  active: z.boolean().nonoptional(),
  googleFormsName: z.string().nonoptional(),
  mailChimpName: z.string().nonoptional(),
  mailChimpClassType: z.string().nonoptional(),
});

export const registerClassRoutes = async (app: FastifyInstance) => {
  const db = await initORM();

  // Get callers for the specified id
  app.get("/:id?", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, [RolesType.AdminViewer]);
    let result:
      | Class
      | Class[]
      | null
      | Loaded<Class, "classInfo", "classInfo.name", never>[] = null;

    const params = request.params as { id: string };

    if (params.id) {
      result = await db.class.findOneOrFail(+params.id, {
        populate: ["registrants", "registrants.user"],
      });
    } else {
      result = await db.em.find(
        Class,
        {},
        {
          populate: ["classInfo", "registrants", "registrants.user"],
          orderBy: { name: QueryOrder.DESC },
          fields: [
            "name",
            "active",
            "googleFormsName",
            "mailChimpName",
            "mailChimpClassType",
            "classInfo.id",
            "classInfo.name",
            "classInfo.googleFormsName",
            "classInfo.mailChimpClassType",
            "registrants.id",
            "registrants.user",
            "registrants.dateRegistered",
            "registrants.user.firstName",
            "registrants.user.lastName",
            "registrants.paymentType",
            "registrants.paidSession",
          ],
        },
      );
    }

    return result;
  });

  app.post("/", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const classObject = classSchema.parse(request.body);
    const newClass: Class = db.class.create(classObject);

    await db.em.flush();
    return { success: true, newClass };
  });

  app.patch("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const classObject = classSchema.parse(request.body);
    const classRecord = await db.class.findOneOrFail(+params.id);

    wrap(classRecord).assign(classObject);

    await db.em.flush();
    return { success: true, newClass: classRecord };
  });

  app.delete("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const classRecord = await db.class.findOneOrFail(+params.id);

    await db.em.remove(classRecord).flush();
    return { success: true };
  });
};
