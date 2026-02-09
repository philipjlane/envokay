# React App Example

A Bun.serve app with a React frontend, using envokay to validate server configuration.

## Setup

```bash
bun install
cp .env.example .env
```

## Run

```bash
bun run --hot server.ts
```

Then open http://localhost:3000

## What this demonstrates

- `port()` for PORT validation
- `url()` for API endpoint validation
- `bool()` for feature flags
- `str()` with `sensitive: true` for secrets
- Env config living in a shared `env.ts` module imported by the server
