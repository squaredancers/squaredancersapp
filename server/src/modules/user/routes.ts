import { FastifyInstance } from "fastify";
import { initORM } from "../../db.js";
import { wrap } from "@mikro-orm/core";
import { User } from "./user.entity.js";
import { RolesType } from "../role/roleType.js";
import { verifyRole } from "../common/roleUtils.js";
import z from "zod";

const userSchema = z.object({
  firstName: z.string().nonoptional(),
  lastName: z.string().nonoptional(),
  phone: z.string().nonoptional(),
  email: z.string().nonoptional(),
  password: z.string().optional(),
  roles: z.string().nullable(),
});

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const registerUserRoutes = async (app: FastifyInstance) => {
  const db = await initORM();

  app.get("/all", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, [RolesType.AdminViewer]);

    const users = await db.em.find(
      User,
      { isDeleted: false },
      { populate: ["roles"] },
    );

    // Remove the password from the result.
    const updatedUsers: any = users.map((user) => {
      return { ...user, password: "" };
    });

    return updatedUsers;
  });

  // Get user for the specified id
  app.get("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, [RolesType.AdminViewer]);

    const { id } = request.params as { id: string };
    const user = await db.user.findOneOrFail(+id);
    const result: any = { ...user };

    delete result.password;

    console.log("Get result:", result);
    return result;
  });

  app.post("/login", async (request) => {
    console.log("In login");
    const response: {
      success: boolean;
      token: string | null;
      firstname: string;
      lastname: string;
      email: string;
      roles: string | null;
    } = {
      success: true,
      token: null,
      firstname: "",
      lastname: "",
      email: "",
      roles: null,
    };

    const loginObject = loginSchema.parse(request.body);
    const userRecord = await db.em.findOneOrFail(User, {
      email: loginObject.email,
      isDeleted: false,
    });
    const passwordOk = await userRecord.verifyPassword(loginObject.password);

    if (passwordOk) {
      response.token = app.jwt.sign(
        { email: loginObject.email },
        { expiresIn: 60 * 60 },
      );
      response.success = true;
      response.firstname = userRecord.firstName;
      response.lastname = userRecord.lastName;
      response.email = userRecord.email;
      response.roles = userRecord.roles;
    }

    return response;
  });

  app.post("/", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const userWithRole = userSchema.parse(request.body);
    const newUser: User = db.user.create(userWithRole);

    // Need to flush the new User so that the id will be assigned to it.
    await db.em.persist(newUser).flush();

    return { success: true };
  });

  // Update the user record for the dues Id specified
  app.patch("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const userWithRole = userSchema.parse(request.body);
    const userRecord = await db.em.findOneOrFail(
      User,
      { id: { $eq: +params.id }, isDeleted: { $eq: false } },
      { populate: ["roles"] },
    );

    try {
      console.log("Before wrap");
      wrap(userRecord).assign(userWithRole);
      console.log("After wrap");
    } catch (exc) {
      console.log(exc);
    }
    await db.em.flush();
    return { success: true, newUser: userRecord };
  });

  app.delete("/:id", async (request) => {
    verifyRole(request?.userInfo?.roles ?? null, []);

    const params = request.params as { id: string };
    const userRecord = await db.user.findOneOrFail(+params.id);

    wrap(userRecord).assign({ ...userRecord, isDeleted: true });
    await db.em.flush();

    return { success: true };
  });
};
