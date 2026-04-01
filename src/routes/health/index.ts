import { type FastifyPluginAsync } from "fastify";

const health: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get("/", async function (_request, reply) {
    let dbStatus: "ok" | "error" = "ok";

    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "error";
    }

    const status = dbStatus === "ok" ? "ok" : "degraded";

    reply.code(status === "ok" ? 200 : 503);
    return {
      status,
      app: fastify.config.APP_NAME,
      database: dbStatus,
    };
  });
};

export default health;
