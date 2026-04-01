import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { Status } from "../../generated/prisma/enums.js";

const API_TO_DB = { pending: Status.PENDING, done: Status.DONE } as const;
const DB_TO_API = {
  [Status.PENDING]: "pending",
  [Status.DONE]: "done",
} as const;

const TodoSchema = Type.Object({
  id: Type.Number(),
  title: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  due_date: Type.Union([Type.String({ format: "date" }), Type.Null()]),
  status: Type.Union([Type.Literal("pending"), Type.Literal("done")]),
  created_at: Type.String({ format: "date-time" }),
});

function serialiseTodo(todo: {
  id: number;
  title: string;
  description: string | null;
  due_date: Date | null;
  status: Status;
  created_at: Date;
}) {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    due_date: todo.due_date ? todo.due_date.toISOString().split("T")[0] : null,
    status: DB_TO_API[todo.status],
    created_at: todo.created_at.toISOString(),
  };
}

const todos: FastifyPluginAsyncTypebox = async (
  fastify,
  _opts,
): Promise<void> => {
  fastify.get(
    "/",
    {
      schema: {
        querystring: Type.Object({
          status: Type.Optional(
            Type.Union([Type.Literal("pending"), Type.Literal("done")]),
          ),
        }),
        response: { 200: Type.Array(TodoSchema) },
      },
    },
    async (request, reply) => {
      const { status } = request.query;

      const where = status ? { status: API_TO_DB[status] } : {};
      const todos = await fastify.prisma.todo.findMany({
        where,
        orderBy: { id: "asc" },
      });

      return reply.send(todos.map(serialiseTodo));
    },
  );

  fastify.post(
    "/",
    {
      schema: {
        body: Type.Object({
          title: Type.String({ minLength: 1 }),
          description: Type.Optional(Type.String()),
          due_date: Type.Optional(Type.String({ format: "date" })),
        }),
        response: { 201: TodoSchema },
      },
    },
    async (request, reply) => {
      const { title, description, due_date } = request.body;

      const todo = await fastify.prisma.todo.create({
        data: {
          title,
          description: description ?? null,
          due_date: due_date ? new Date(due_date) : null,
        },
      });

      return reply.status(201).send(serialiseTodo(todo));
    },
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        params: Type.Object({
          id: Type.Number(),
        }),
        body: Type.Object({
          title: Type.Optional(Type.String({ minLength: 1 })),
          description: Type.Optional(Type.String()),
          due_date: Type.Optional(Type.String({ format: "date" })),
          status: Type.Optional(
            Type.Union([Type.Literal("pending"), Type.Literal("done")]),
          ),
        }),
        response: { 200: TodoSchema },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const existing = await fastify.prisma.todo.findUnique({ where: { id } });
      if (!existing) {
        return reply.notFound("Todo not found");
      }

      const { title, description, due_date, status } = request.body;
      const data: Record<string, unknown> = {};
      if (title !== undefined) data.title = title;
      if (description !== undefined) data.description = description;
      if (due_date !== undefined) data.due_date = new Date(due_date);
      if (status !== undefined) data.status = API_TO_DB[status];

      const updated = await fastify.prisma.todo.update({
        where: { id },
        data,
      });

      return reply.send(serialiseTodo(updated));
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: Type.Object({
          id: Type.Number(),
        }),
        response: { 204: Type.Null() },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const existing = await fastify.prisma.todo.findUnique({ where: { id } });
      if (!existing) {
        return reply.notFound("Todo not found");
      }

      await fastify.prisma.todo.delete({ where: { id } });

      return reply.status(204).send(null);
    },
  );

  fastify.get(
    "/overdue",
    {
      schema: {
        response: { 200: Type.Array(TodoSchema) },
      },
    },
    async (_request, reply) => {
      const now = new Date();

      const todos = await fastify.prisma.todo.findMany({
        where: {
          status: "PENDING",
          due_date: { lt: now },
        },
        orderBy: { id: "asc" },
      });

      return reply.send(todos.map(serialiseTodo));
    },
  );
};

export default todos;
