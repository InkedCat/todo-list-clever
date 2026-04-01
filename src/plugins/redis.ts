import fp from "fastify-plugin";
import fastifyRedis from "@fastify/redis";

/**
 * Registers two namespaced Redis connections:
 *  - `pub`  for publishing messages (PUBLISH, INCR, DECR, GET, etc.)
 *  - `sub`  for subscribing to channels (SUBSCRIBE, MESSAGE callbacks)
 *
 * Redis requires separate connections for pub and sub because a connection
 * in subscriber mode can only issue (P)SUBSCRIBE / (P)UNSUBSCRIBE commands.
 *
 * Access via: fastify.redis.pub  /  fastify.redis.sub
 *
 * @see https://github.com/fastify/fastify-redis
 */
export default fp(
  async (fastify) => {
    const url = fastify.config.REDIS_URL;

    await fastify.register(fastifyRedis, { url, namespace: "pub" });
    await fastify.register(fastifyRedis, { url, namespace: "sub" });

    fastify.log.info("Redis pub/sub clients connected");
  },
  { name: "redis", dependencies: ["config"] },
);
