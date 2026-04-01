import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { FastifyReply } from "fastify";

const CHANNEL = "todo_alerts";
const LISTENERS_KEY = "sse:listeners";
const PING_INTERVAL_MS = 30_000;

const alerts: FastifyPluginAsyncTypebox = async (
  fastify,
  _opts,
): Promise<void> => {
  const clients = new Set<FastifyReply>();

  const sub = fastify.redis.sub;
  const pub = fastify.redis.pub;

  await sub.subscribe(CHANNEL);

  sub.on("message", (channel: string, message: string) => {
    if (channel !== CHANNEL) return;

    const event = `event: todo_alert\ndata: ${message}\n\n`;
    for (const client of clients) {
      client.raw.write(event);
    }
  });

  fastify.addHook("onClose", async () => {
    await sub.unsubscribe(CHANNEL);

    for (const client of clients) {
      client.raw.end();
    }
    clients.clear();
  });

  fastify.get("/", async (request, reply) => {
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    clients.add(reply);
    await pub.incr(LISTENERS_KEY);

    const pingTimer = setInterval(() => {
      reply.raw.write("event: ping\ndata: {}\n\n");
    }, PING_INTERVAL_MS);

    request.raw.on("close", async () => {
      clearInterval(pingTimer);
      clients.delete(reply);
      await pub.decr(LISTENERS_KEY);
    });

    // Prevent Fastify from closing the response, we manage it manually
    await reply.hijack();
  });
};

export default alerts;
