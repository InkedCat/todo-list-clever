import fp from 'fastify-plugin'

export interface ConfigPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<ConfigPluginOptions>(async (fastify, opts) => {
  fastify.decorate('config', function () {
    return {}
  })
})

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {

  }
}
