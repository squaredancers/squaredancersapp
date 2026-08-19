import { FilterQuery, Loaded, QueryOrder, wrap } from "@mikro-orm/core";
import { FastifyInstance, RouteShorthandOptions } from "fastify";
import z from "zod";
import { initORM } from "../../db.js";
import { Class } from "../class/class.entity.js";
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
  hours: z.number(),
});

const dateRangeSchema = z.object({
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
});

interface QueryParams {
  start?: number;
  end?: number;
}

const dayMap = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 0,
};

// Finds the first date that matches the dayToFind.
const findStartDate = (date: Date, dayToFind: number): Date => {
  const startDate = new Date(date);
  let dayOfWeek = startDate.getDay();

  while (dayOfWeek !== dayToFind) {
    startDate.setDate(startDate.getDate() + 1);

    dayOfWeek = startDate.getDay();
  }

  return startDate;
};

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
        orderBy: { date: QueryOrder.ASC },
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
          "hours",
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

  // Gets all the caller hours for the specified event date range.
  app.post("/callers", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const dateRange = dateRangeSchema.parse(request.body);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const allCallerHours: Record<number, number> = {};

    const events = await db.em.find(Event, {
      date: {
        $gte: startDate, // greater than or equal to start date
        $lt: endDate, // less than the end date
      },
      class: { $ne: null },
    });

    events.forEach((event) => {
      const caller = event.caller;
      const prevCallerHours = allCallerHours[caller.id] ?? 0;

      allCallerHours[caller.id] = prevCallerHours + event.hours;
    });

    return { success: true, callerHours: allCallerHours };
  });

  app.post("/populate", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const { startDate: startDatestr, endDate: endDateStr } =
      dateRangeSchema.parse(request.body);
    const startDate = new Date(startDatestr);
    const endDate = new Date(endDateStr);

    // Set the end date to be exactly the start of the next day so that
    // the less than date comparison will always be less than the end date
    // specified.
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    const currentEvents: Record<string, Event> = {};
    const events: Event[] = await db.em.find(
      Event,
      {
        date: {
          $gte: startDate, // greater than or equal to start date
          $lt: endDate, // less than the end date
        },
      },
      { populate: ["class"] },
    );

    events.forEach((event) => {
      const eventDate = event.date.toISOString().substring(0, 10);
      const classId = event.class?.id ?? 0;
      const recordKey = eventDate + "-" + classId;

      currentEvents[recordKey] = event;
    });

    const activeClasses: Class[] = await db.em.find(
      Class,
      {
        active: true,
      },
      { populate: ["classInfo", "classInfo.location", "classInfo.caller"] },
    );

    activeClasses.forEach((clazz) => {
      const classDayOfWeek = dayMap[clazz.classInfo.day];
      const currentDate = findStartDate(startDate, classDayOfWeek);
      const classId = clazz.id;

      while (currentDate < endDate) {
        const eventKey =
          currentDate.toISOString().substring(0, 10) + "-" + classId;

        // Check if the class event already exists.  We will create an event if it doesn't exist.
        if (!currentEvents[eventKey]) {
          const hours = clazz.classInfo.hours;
          const callerRate = clazz.classInfo.caller.hourlyRate;
          const callerCharge = (hours * callerRate) / 100;

          db.event.create({
            name: clazz.name,
            date: new Date(currentDate),
            class: classId,
            location: clazz.classInfo.location,
            caller: clazz.classInfo.caller,
            draft: false,
            roomCharge: clazz.classInfo.location.rent,
            hours,
            callerCharge,
          });
        }

        currentDate.setDate(currentDate.getDate() + 7);
      }
    });

    await db.em.flush();
    return { success: true };
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
