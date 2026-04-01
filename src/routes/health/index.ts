import { type FastifyPluginAsync } from 'fastify'

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/health', async function (request, reply) {
    return 'Healthy !'
  })
}

export default example
