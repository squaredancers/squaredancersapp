import { FilterQuery, Loaded, QueryOrder, wrap } from "@mikro-orm/core";
import { FastifyInstance, RouteShorthandOptions } from "fastify";
import z from "zod";
import { initORM } from "../../db.js";
import { verifyRole } from "../common/roleUtils.js";
import { RolesType } from "../role/roleType.js";
import { Event } from "./event.entity.js";

const eventSchema = z.object({
  name: z.string(),
  location: z.number(),
  caller: z.number(),
  date: z.iso.datetime(),
  class: z.number().nullable(),
  draft: z.boolean(),
  roomCharge: z.number(),
  callerCharge: z.number(),
});

interface QueryParams {
  start?: number;
  end?: number;
}

export const registerEventRoutes = async (app: FastifyInstance) => {
  const db = await initORM();

  const routeOptions: RouteShorthandOptions = {
    schema: {
      querystring: {
        type: "object",
        properties: {
          start: { type: "number" },
          end: { type: "number" },
        },
      },
    },
  };

  // Get callers for the specified id
  app.get<{ Querystring: QueryParams }>("/:id?", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, [RolesType.AdminViewer]);
    let result:
      | Event
      | Event[]
      | null
      | Loaded<
          Event,
          "location" | "caller" | "class" | "caller.user",
          | "name"
          | "date"
          | "location"
          | "caller"
          | "class"
          | "draft"
          | "roomCharge"
          | "callerCharge"
          | "location.name"
          | "location.id"
          | "caller.id"
          | "class.name"
          | "caller.user.firstName"
          | "caller.user.lastName"
        >[] = null;

    const params = request.params as { id: string };
    const { start, end } = request.query;
    const startDate = start ? new Date(start) : new Date("1900-01-01");
    const endDate = end ? new Date(end) : new Date("2500-01-01");
    const whereClause: FilterQuery<Event> = {
      date: {
        $gte: startDate, // greater than or equal to start date
        $lt: endDate, // less than the end date
      },
    };

    if (params.id) {
      result = await db.event.findOneOrFail(+params.id);
    } else {
      result = await db.em.find(Event, whereClause, {
        populate: ["caller", "location", "class", "caller.user"],
        orderBy: { date: QueryOrder.DESC },
        fields: [
          "class",
          "class.name",
          "name",
          "date",
          "location",
          "location.id",
          "location.name",
          "caller",
          "caller.id",
          "caller.user.firstName",
          "caller.user.lastName",
          "draft",
          "roomCharge",
          "callerCharge",
        ],
      });
    }

    return result;
  });

  app.post("/", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const eventObject = eventSchema.parse(request.body);
    const newEvent: Event = db.event.create(eventObject);

    await db.em.flush();
    return { success: true, newEvent };
  });

  app.patch("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const eventObject = eventSchema.parse(request.body);
    const eventRecord = await db.event.findOneOrFail(+params.id);

    wrap(eventRecord).assign(eventObject);

    await db.em.flush();
    return { success: true, newEvent: eventRecord };
  });

  app.delete("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const eventRecord = await db.event.findOneOrFail(+params.id);

    await db.em.remove(eventRecord).flush();
    return { success: true };
  });
};
