# CLI Example

A simple CLI tool that fetches weather data from an API, configured entirely through environment variables validated by envokay.

## Setup

```bash
bun install
cp .env.example .env
# Edit .env with your actual API key
```

## Run

```bash
# Bun loads .env automatically
bun run index.ts
bun run index.ts --city "New York"

# Node 20.6+
node --env-file=.env index.ts

# Deno
deno run --allow-env --allow-net index.ts
```

## What this demonstrates

- Required vars (`API_KEY`) that throw if missing
- Default values (`CITY`, `UNITS`)
- Sensitive redaction (`API_KEY` won't leak in error output)
- `oneOf` restricting values to a known set
- `num` with min/max constraints
