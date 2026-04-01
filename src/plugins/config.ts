import "dotenv/config";
import fp from "fastify-plugin";

export interface Config {
  DATABASE_URL: string;
  PORT: number;
  HOST: string;
  NODE_ENV: "development" | "production";
}

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * This plugin loads configuration from environment variables (with dotenv
 * support) and decorates the Fastify instance with a typed `config` object.
 *
 * Required env vars: DATABASE_URL
 * Optional env vars: PORT (default 3000), HOST (default 0.0.0.0), NODE_ENV (default development)
 */
export default fp(
  async (fastify) => {
    const config: Config = {
      DATABASE_URL: getEnvOrThrow("DATABASE_URL"),
      PORT: parseInt(process.env["PORT"] ?? "3000", 10),
      HOST: process.env["HOST"] ?? "0.0.0.0",
      NODE_ENV:
        (process.env["NODE_ENV"] as Config["NODE_ENV"]) ?? "development",
    };

    fastify.decorate("config", config);
  },
  { name: "config" },
);

declare module "fastify" {
  export interface FastifyInstance {
    config: Config;
  }
}
