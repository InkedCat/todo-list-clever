# todo-list-clever

A to-do list web application built with Fastify and TypeScript.

## Prerequisites

- Node.js
- pnpm

## Setup

```bash
pnpm install
```

## Usage

Start the development server with auto-reload:

```bash
pnpm dev
```

Build and start for production:

```bash
pnpm start
```

## Project Structure

```
src/
  app.ts              # App entry point, auto-loads plugins and routes
  plugins/            # Fastify plugins (config, sensible)
  routes/             # Route handlers (mapped by directory structure)
```

## License

GPL-3.0
