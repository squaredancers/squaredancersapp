import { Loaded, wrap } from "@mikro-orm/core";
import { FastifyInstance } from "fastify";
import z from "zod";
import { initORM } from "../../db.js";
import { verifyRole } from "../common/roleUtils.js";
import { RolesType } from "../role/roleType.js";
import csvParser from "../utils/csvparser.js";
import { ClassRegistrant } from "./classRegistrant.entity.js";

const classSchema = z.object({
  class: z.number().nonoptional(),
  user: z.number().nonoptional(),
  paymentType: z.enum(["session", "perClass"]).nonoptional(),
  paidSession: z.boolean().nonoptional(),
  dateRegistered: z.date(),
});

const bulkAddSchema = z.array(z.string());

export const registerClassRegistrantRoutes = async (app: FastifyInstance) => {
  const db = await initORM();

  // Get Class registrant from id
  app.get("/:id?", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, [RolesType.AdminViewer]);
    let result:
      | ClassRegistrant
      | Loaded<
          ClassRegistrant,
          "class" | "user",
          | "paymentType"
          | "paidSession"
          | "dateRegistered"
          | "id"
          | "class.name"
          | "class.id"
          | "class.active"
          | "user.id"
          | "user.firstName"
          | "user.lastName",
          never
        >[]
      | null = null;
    const params = request.params as { id: string };

    if (params.id) {
      result = await db.classRegistrant.findOneOrFail(+params.id);
    } else {
      result = await db.em.find(
        ClassRegistrant,
        {},
        {
          populate: ["class", "user"],
          fields: [
            "id",
            "paymentType",
            "paidSession",
            "dateRegistered",
            "class.id",
            "class.name",
            "class.active",
            "user.id",
            "user.firstName",
            "user.lastName",
          ],
        },
      );
    }

    return result;
  });

  app.post("/bulkadd", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const csvRegistrants = bulkAddSchema.parse(request.body);
    const parsedRegistrants = csvParser(csvRegistrants);
    const responseMessage: string[] = [];
    const currentRegistrants = await db.em.find(
      ClassRegistrant,
      {},
      {
        populate: ["class", "user"],
        fields: [
          "id",
          "paymentType",
          "paidSession",
          "dateRegistered",
          "class.id",
          "class.name",
          "class.active",
          "user.id",
          "user.firstName",
          "user.lastName",
          "user.email",
        ],
      },
    );

    await db.em.flush();
    return responseMessage;
  });

  app.post("/", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const classObject = classSchema.parse(request.body);
    const newClassRegistrant: ClassRegistrant =
      db.classRegistrant.create(classObject);

    await db.em.flush();
    return { success: true, newClassRegistrant };
  });

  app.patch("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const classObject = classSchema.parse(request.body);
    const classRegistrantRecord = await db.classRegistrant.findOneOrFail(
      +params.id,
    );

    wrap(classRegistrantRecord).assign(classObject);

    await db.em.flush();
    return { success: true, newClassRegistrant: classRegistrantRecord };
  });

  app.delete("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const classRegistrantRecord = await db.classRegistrant.findOneOrFail(
      +params.id,
    );

    await db.em.remove(classRegistrantRecord).flush();
    return { success: true };
  });
};
