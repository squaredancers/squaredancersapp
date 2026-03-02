import { FastifyInstance } from "fastify";

export const registerEnvRoutes = async (app: FastifyInstance) => {
  // Get all environment variables
  app.get("/", async (request) => {
    const title = process.env.TITLE;
    const mailingEmail = process.env.MAILING_email;

    console.log("In get env", title);
    return { title, mailingEmail };
  });
};
