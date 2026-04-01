import { type FastifyPluginAsync } from "fastify";

const health: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get("/health", async function (_request, _reply) {
    return "Healthy !";
  });
};

export default health;
