import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";

const HealthResponseSchema = Type.Object({
  status: Type.Union([Type.Literal("ok"), Type.Literal("degraded")]),
  app: Type.String(),
  database: Type.Union([Type.Literal("ok"), Type.Literal("error")]),
});

const health: FastifyPluginAsyncTypebox = async (fastify, _opts): Promise<void> => {
  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: HealthResponseSchema,
          503: HealthResponseSchema,
        },
      },
    },
    async function (_request, reply) {
      let dbStatus: "ok" | "error" = "ok";

      try {
        await fastify.prisma.$queryRaw`SELECT 1`;
      } catch {
        dbStatus = "error";
      }

      const status: "ok" | "degraded" = dbStatus === "ok" ? "ok" : "degraded";

      reply.code(status === "ok" ? 200 : 503);
      return {
        status,
        app: fastify.config.APP_NAME,
        database: dbStatus,
      };
    },
  );
};

export default health;
