import { FastifyInstance } from "fastify";

export const registerOAuth2Routes = async (app: FastifyInstance) => {
  app.post("/", async (request) => {
    console.log("Got oauth request", request.body);
    return { success: true };
  });
};
