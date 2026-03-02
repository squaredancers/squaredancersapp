import fastifyJWT from "@fastify/jwt";
import { MikroORM, NotFoundError, RequestContext } from "@mikro-orm/core";
import { fastify, FastifyError } from "fastify";
import { registerCallerRoutes } from "./modules/caller/routes.js";
import { registerClassRoutes } from "./modules/class/routes.js";
import { registerClassInfoRoutes } from "./modules/classInfo/routes.js";
import { registerEnvRoutes } from "./modules/env/routes.js";
import { registerLocationRoutes } from "./modules/location/routes.js";
import { registerPaymentRoutes } from "./modules/payments/routes.js";
import { registerRoleRoutes } from "./modules/role/routes.js";
import { registerUserRoutes } from "./modules/user/routes.js";

import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { initORM } from "./db.js";
import { AuthError } from "./modules/common/roleUtils.js";
import { registerEventRoutes } from "./modules/event/routes.js";
import { User } from "./modules/user/user.entity.js";

declare module "fastify" {
  interface FastifyRequest {
    userInfo: {
      email: string;
      roles: string | null;
    } | null; // Use '| null' or make it optional as it might not be immediately available
  }
}

export async function bootstrap(port = 3001) {
  const orm = await MikroORM.init();
  const db = await initORM();
  const jwtSecret = `Square dancers ${Math.floor(Math.random() * 1000000)}`;
  const keyFile = readFileSync(
    path.join(process.cwd(), "server.key"),
  ).toString();
  const certFile = readFileSync(
    path.join(process.cwd(), "server.cert"),
  ).toString();
  const httpsOptions = {
    allowHTTP1: true,
    key: keyFile,
    cert: certFile,
  };
  const app = fastify({
    https: httpsOptions,
    logger: {
      level: "debug", // Use 'debug' for more verbosity
    },
  });

  // register JWT plugin
  app.register(fastifyJWT, {
    secret: jwtSecret,
  });

  // register request context hook
  app.addHook("onRequest", (request, reply, done) => {
    RequestContext.create(orm.em, done);
  });

  app.addHook("onRequest", async (request) => {
    console.log("In on request headers=", request.headers);

    // There wont be a token for the login path
    let routerPath = request.routeOptions.url ?? "";

    routerPath = "login"; //debug

    console.log("Router path=", routerPath);
    if (routerPath.indexOf("login") === -1) {
      const ret = await request.jwtVerify<{ email: string }>();
      const userRecord = await db.em.findOneOrFail(User, { email: ret.email });
      const userInfo = {
        email: ret.email,
        roles: userRecord.roles,
      };

      request.userInfo = userInfo;
    }
  });

  // shut down the connection when closing the app
  app.addHook("onClose", async () => {
    await orm.close();
  });

  app.setErrorHandler((error: FastifyError | NotFoundError, request, reply) => {
    if (error instanceof AuthError) {
      return reply.status(401).send({ error: error.message });
    }

    // we also handle not found errors automatically
    // `NotFoundError` is an error thrown by the ORM via `em.findOneOrFail()` method
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ error: error.message });
    }

    app.log.error(error);
    reply.status(error.statusCode ?? 500).send({ error: error.message });
  });

  // register routes here
  // ...
  app.register(registerEnvRoutes, { prefix: "api/env" });
  app.register(registerUserRoutes, { prefix: "api/user" });
  app.register(registerLocationRoutes, { prefix: "api/location" });
  app.register(registerCallerRoutes, { prefix: "api/caller" });
  app.register(registerClassInfoRoutes, { prefix: "api/classinfo" });
  app.register(registerClassRoutes, { prefix: "api/class" });
  app.register(registerPaymentRoutes, { prefix: "api/payments" });
  app.register(registerRoleRoutes, { prefix: "api/roles" });
  app.register(registerEventRoutes, { prefix: "api/event" });

  const url = await app.listen({ port });

  return { app, url };
}
