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
bun run index.ts
bun run index.ts --city "New York"
```

## What this demonstrates

- Required vars (`API_KEY`) that throw if missing
- Default values (`CITY`, `UNITS`)
- Sensitive redaction (`API_KEY` won't leak in error output)
- `oneOf` restricting values to a known set
- `num` with min/max constraints
