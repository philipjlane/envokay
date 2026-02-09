# Hono API Example

A REST API built with Hono, using envokay for configuration and demonstrating Standard Schema interop with Zod.

## Setup

```bash
bun install
cp .env.example .env
```

## Run

```bash
bun run server.ts
```

## Endpoints

- `GET /` — Health check
- `GET /api/todos` — List todos
- `POST /api/todos` — Create a todo (`{ "title": "..." }`)

## What this demonstrates

- `port()`, `str()`, `bool()`, `oneOf()` validators
- Using envokay's Standard Schema validators alongside Zod schemas in `createEnv`
- Shared `env.ts` config module
- `sensitive: true` for database credentials
