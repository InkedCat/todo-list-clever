import Fastify from 'fastify'
import app from './app.js'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'

const server = Fastify({
  logger: {
    level: 'info',
  },
}).withTypeProvider<TypeBoxTypeProvider>()

server.register(app)

const port = parseInt(process.env['PORT'] ?? '3000', 10)
const host = process.env['HOST'] ?? '0.0.0.0'

server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
})
