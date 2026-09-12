import fastifyJWT from "@fastify/jwt";
import { MikroORM, NotFoundError, RequestContext } from "@mikro-orm/core";
import "dotenv/config";
import { fastify, FastifyError } from "fastify";
import { registerCallerRoutes } from "./modules/caller/routes.js";
import { registerClassRoutes } from "./modules/class/routes.js";
import { registerClassInfoRoutes } from "./modules/classInfo/routes.js";
import { registerClassListsRoutes } from "./modules/ClassLists/routes.js";
import { registerClassRegistrantRoutes } from "./modules/classRegistrant/routes.js";
import { registerEnvRoutes } from "./modules/env/routes.js";
import { registerLocationRoutes } from "./modules/location/routes.js";
import { registerReportRoutes } from "./modules/reports/routes.js";
import { registerRoleRoutes } from "./modules/role/routes.js";
import { registerSettingsRoutes } from "./modules/settings/routes.js";
import { registerUserRoutes } from "./modules/user/routes.js";

import fastifyStatic from "@fastify/static";
import { readFileSync } from "fs";
import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "path";
import { initORM } from "./db.js";
import { AuthError } from "./modules/common/roleUtils.js";
import { registerEventRoutes } from "./modules/event/routes.js";
import { User } from "./modules/user/user.entity.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  const useToken = process.env.USE_TOKEN_ONLY;
  const useTokenEmail = useToken ? "TokenEmail" : null;
  let useTokenToken: string | null = null;

  // register JWT plugin
  app
    .register(fastifyJWT, {
      secret: jwtSecret,
    })
    .after((err) => {
      if (err) throw err;

      // Safe to run here
      useTokenToken =
        useTokenEmail !== null
          ? app.jwt.sign({ email: useTokenEmail }, { expiresIn: 60 * 60 })
          : null;
    });

  // register request context hook
  app.addHook("onRequest", (request, reply, done) => {
    RequestContext.create(orm.em, done);
  });

  app.addHook("onRequest", async (request) => {
    console.log("In on request headers=", request.headers);

    // There wont be a token for the login path
    let routerPath = request.routeOptions.url ?? "";

    //routerPath = "login"; //debug

    console.log(
      "Router path=",
      routerPath,
      "router length=",
      routerPath.length,
    );

    if (routerPath === "/*") return;

    if (useTokenToken !== null) {
      // We are just checking that the token is as
      const authHeaderToken = request.headers.authorization?.split(" ");

      console.log("useToken=", useTokenToken, "real token=", authHeaderToken);
      if (
        authHeaderToken?.length !== 2 ||
        authHeaderToken[1] !== useTokenToken
      ) {
        throw new Error("Unauthorized request");
      }
    } else if (routerPath.indexOf("login") === -1) {
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

  app.register(fastifyStatic, {
    root: path.join(__dirname, "public"), // Folder where your static files live
    prefix: "/", // URL path to access the files (e.g., /index.html)
  });

  // register routes here
  // ...
  app.register(registerEnvRoutes, { prefix: "api/env" });
  app.register(registerUserRoutes, { prefix: "api/user" });
  app.register(registerLocationRoutes, { prefix: "api/location" });
  app.register(registerCallerRoutes, { prefix: "api/caller" });
  app.register(registerClassInfoRoutes, { prefix: "api/classinfo" });
  app.register(registerClassRoutes, { prefix: "api/class" });
  app.register(registerClassRegistrantRoutes, { prefix: "api/registrant" });
  app.register(registerRoleRoutes, { prefix: "api/roles" });
  app.register(registerEventRoutes, { prefix: "api/event" });
  app.register(registerReportRoutes, { prefix: "api/report" });
  app.register(registerSettingsRoutes, { prefix: "api/settings" });
  app.register(registerClassListsRoutes, { prefix: "api/classlists" });

  const url = await app.listen({ port });

  if (useTokenToken !== null) {
    const urlWithToken = `${url}?token=${useTokenToken}`;
    const command = `start ${urlWithToken}`;

    console.log("Command=", command);
    exec(command);
  }

  return { app, url };
}
