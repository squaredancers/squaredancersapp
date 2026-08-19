import { FastifyInstance } from "fastify";
import z from "zod";
import { initORM } from "../../db.js";
import { Caller } from "../caller/caller.entity.js";
import { verifyRole } from "../common/roleUtils.js";
import { Event } from "../event/event.entity.js";

const dateRangeScheme = z.object({
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
});

interface CallerWithHours extends Caller {
  hours: number;
}

export const registerReportRoutes = async (app: FastifyInstance) => {
  const db = await initORM();

  app.post("/callers", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const dateRange = dateRangeScheme.parse(request.body);
    const startDate = new Date(dateRange.startDate.substring(0, 10)); // Use only the date part
    const endDate = new Date(dateRange.endDate.substring(0, 10));
    const allCallerHours: Record<number, CallerWithHours> = {};

    startDate.setHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate() + 1);
    console.log("start/end=", startDate, endDate);
    const events = await db.em.find(
      Event,
      {
        date: {
          $gte: startDate, // greater than or equal start date
          $lt: endDate, // less than the end date
        },
        class: { $ne: null },
      },
      { populate: ["caller", "caller.user"] },
    );

    events.forEach((event) => {
      const caller = event.caller;
      let prevCallerHours: CallerWithHours = allCallerHours[caller.id];

      if (!prevCallerHours) {
        prevCallerHours = { ...caller, hours: 0 };
        allCallerHours[caller.id] = prevCallerHours;
      }

      prevCallerHours.hours += event.hours;
    });

    return { success: true, callerHours: Object.values(allCallerHours) };
  });
};
