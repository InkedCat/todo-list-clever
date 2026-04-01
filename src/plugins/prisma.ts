import fp from 'fastify-plugin'
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * This plugin adds a Prisma client instance to the Fastify server.
 *
 * @see https://www.prisma.io/docs
 */
export default fp(async (fastify) => {
  const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] })
  const prisma = new PrismaClient({ adapter })

  await prisma.$connect()

  fastify.decorate('prisma', prisma)

  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect()
  })
})

declare module 'fastify' {
  export interface FastifyInstance {
    prisma: PrismaClient
  }
}
