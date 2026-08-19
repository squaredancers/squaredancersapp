import { wrap } from "@mikro-orm/core";
import { FastifyInstance } from "fastify";
import z from "zod";
import { initORM } from "../../db.js";
import { verifyRole } from "../common/roleUtils.js";
import { RolesType } from "../role/roleType.js";
import { Settings } from "./settings.entity.js";

const settingsSchema = z.object({
  name: z.string().nonoptional(),
  value: z.string().nonoptional(),
});

export const registerSettingsRoutes = async (app: FastifyInstance) => {
  const db = await initORM();

  // Get all settings
  app.get("/", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, [RolesType.AdminViewer]);
    let result: Settings[] | null = null;

    result = await db.settings.findAll();

    return result;
  });

  app.post("/", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const settingsObject = settingsSchema.parse(request.body);
    const existingSettingValue = await db.settings.findOne({
      name: settingsObject.name,
    });

    console.log(
      "In create setting=",
      settingsObject,
      "existing=",
      existingSettingValue,
    );
    if (existingSettingValue) {
      // There is an existing value for this setting so we will not create a new one.
      return { success: false };
    } else {
      const settings: Settings = db.settings.create(settingsObject);

      await db.em.flush();
      return { success: true, settings };
    }
  });

  app.patch("/", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const settingsObject = settingsSchema.parse(request.body);
    const newSettingValue = await db.settings.findOneOrFail({
      name: settingsObject.name,
    });

    console.log("Found setting,", newSettingValue);
    wrap(newSettingValue).assign(settingsObject);

    await db.em.flush();
    return { success: true, newSettingValue };
  });

  app.delete("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const settingsRecord = await db.settings.findOneOrFail(+params.id);

    await db.em.remove(settingsRecord).flush();
    return { success: true };
  });
};
