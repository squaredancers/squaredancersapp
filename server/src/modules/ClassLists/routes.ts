import { wrap } from "@mikro-orm/core";
import { FastifyInstance } from "fastify";
import z from "zod";
import { initORM } from "../../db.js";
import { verifyRole } from "../common/roleUtils.js";
import { RolesType } from "../role/roleType.js";
import { ClassLists } from "./classLists.entity.js";

const classListsSchema = z.object({
  title: z.string().nonoptional(),
  class: z.number().nonoptional(),
  columns: z.string().nonoptional(),
});

export const registerClassListsRoutes = async (app: FastifyInstance) => {
  const db = await initORM();

  // Get classInfo for the specified id
  app.get("/:id?", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, [RolesType.AdminViewer]);
    let result: ClassLists | ClassLists[] | null = null;

    const params = request.params as { id: string };

    if (params.id) {
      result = await db.classLists.findOneOrFail(+params.id, {});
    } else {
      result = await db.em.find(
        ClassLists,
        {},
        {
          populate: ["class", "class.registrants", "class.registrants.user"],
        },
      );
    }

    return result;
  });

  app.post("/", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const classListsObject = classListsSchema.parse(request.body);
    const newClassListInfo: ClassLists = db.classLists.create(classListsObject);

    await db.em.flush();
    return { success: true, newClassListInfo };
  });

  app.patch("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const classListsObject = classListsSchema.parse(request.body);
    const classListsRecord = await db.classLists.findOneOrFail(+params.id);

    wrap(classListsRecord).assign(classListsObject);

    await db.em.flush();
    return { success: true, newClassLists: classListsRecord };
  });

  app.delete("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const classListsRecord = await db.classLists.findOneOrFail(+params.id);

    await db.em.remove(classListsRecord).flush();
    return { success: true };
  });
};
