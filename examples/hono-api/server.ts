import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./env.ts";

const app = new Hono();

// CORS configured from env
app.use("*", cors({ origin: env.CORS_ORIGIN }));

// Simple logger using LOG_LEVEL
app.use("*", async (c, next) => {
	if (env.LOG_LEVEL === "debug") {
		console.log(`${c.req.method} ${c.req.path}`);
	}
	await next();
});

// In-memory store for the example
const todos: { id: number; title: string; done: boolean }[] = [];
let nextId = 1;

// Health check — safe to serialize env (sensitive fields are redacted)
app.get("/", (c) => {
	return c.json({
		status: "ok",
		config: (env as unknown as { toJSON: () => unknown }).toJSON(),
	});
});

app.get("/api/todos", (c) => {
	return c.json(todos);
});

app.post("/api/todos", async (c) => {
	const body = await c.req.json<{ title?: string }>();
	if (!body.title || typeof body.title !== "string") {
		return c.json({ error: "title is required" }, 400);
	}

	const todo = { id: nextId++, title: body.title, done: false };
	todos.push(todo);
	return c.json(todo, 201);
});

console.log(`Hono API running at http://localhost:${env.PORT}`);
console.log(`Log level: ${env.LOG_LEVEL}`);
console.log(`CORS origin: ${env.CORS_ORIGIN}`);
console.log(`Rate limit: ${env.RATE_LIMIT_MAX} req/min`);

export default {
	port: env.PORT,
	fetch: app.fetch,
};
