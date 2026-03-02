import { FastifyInstance } from "fastify";
import { initORM } from "../../db.js";
import { wrap, QueryOrder } from "@mikro-orm/core";
import { RolesType } from "../role/roleType.js";
import { verifyRole } from "../common/roleUtils.js";
import { Payments } from "./payments.entity.js";
import z from "zod";

const paymentsSchema = z.object({
  user: z.number().nonoptional(),
  class: z.number().nonoptional(),
  paid: z.boolean().nonoptional(),
  comment: z.string(),
});

export const registerPaymentRoutes = async (app: FastifyInstance) => {
  const db = await initORM();

  // Get all payments for a class specified by id
  app.get("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, [RolesType.AdminViewer]);

    const params = request.params as { id: string };

    const payments = await db.em.find(
      Payments,
      { class: +params.id },
      { populate: ["user"], orderBy: { user: { lastName: QueryOrder.ASC } } },
    );

    return payments;
  });

  app.post("/", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const paymentsObject = paymentsSchema.parse(request.body);
    const newPayment: Payments = db.payments.create(paymentsObject);

    await db.em.flush();
    return { success: true, newPayment };
  });

  app.patch("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const paymentObject = paymentsSchema.parse(request.body);
    const paymentRecord = await db.payments.findOneOrFail(+params.id);

    wrap(paymentRecord).assign(paymentObject);

    await db.em.flush();
    return { success: true, newPayment: paymentRecord };
  });

  app.delete("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const paymentRecord = await db.payments.findOneOrFail(+params.id);

    await db.em.remove(paymentRecord).flush();
    return { success: true };
  });
};
