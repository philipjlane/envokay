# envokay

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Type-safe environment variable validation with [Standard Schema](https://github.com/standard-schema/standard-schema) support.

## Why envokay?

Existing solutions like `envalid` and `t3-env` work well but lack support for the **Standard Schema** specification. envokay validators implement `StandardSchemaV1`, which means:

- **Use envokay validators anywhere** — TanStack Form, tRPC, Drizzle, and any Standard Schema consumer can use envokay validators directly, with no adapters.
- **Use any schema library inside `createEnv`** — Bring your own Zod, Valibot, or ArkType schemas and mix them with built-in validators.
- **Zero lock-in** — Standard Schema is a shared interface across the ecosystem.

## Installation

```bash
# bun
bun add envokay

# npm
npm install envokay

# pnpm
pnpm add envokay
```

## Quick Start

```ts
import { createEnv, str, port, bool, url, num, oneOf } from 'envokay'

export const env = createEnv({
  DATABASE_URL: url(),
  PORT: port({ default: 3000 }),
  DEBUG: bool({ default: false }),
  API_KEY: str({ sensitive: true }),
  LOG_LEVEL: oneOf(['debug', 'info', 'warn', 'error'] as const, { default: 'info' }),
  MAX_RETRIES: num({ min: 0, max: 10 }),
})

// Fully typed — env.PORT is number, env.DEBUG is boolean, etc.
console.log(env.PORT) // 3000
```

## API Reference

All validators accept an optional options object with:

| Option      | Type      | Description                                       |
|-------------|-----------|---------------------------------------------------|
| `default`   | `T`       | Default value when the env var is not set          |
| `sensitive` | `boolean` | Redact value in error messages and `.toJSON()`     |

### `str(options?)`

Validates a string value.

| Option      | Type     | Description             |
|-------------|----------|-------------------------|
| `minLength` | `number` | Minimum string length   |
| `maxLength` | `number` | Maximum string length   |
| `pattern`   | `RegExp` | Regex the value must match |

```ts
str({ minLength: 1 })
str({ pattern: /^sk_/ })
```

### `num(options?)`

Parses and validates a number.

| Option | Type     | Description     |
|--------|----------|-----------------|
| `min`  | `number` | Minimum value   |
| `max`  | `number` | Maximum value   |

```ts
num({ min: 0, max: 100 })
```

### `port(options?)`

Validates an integer between 1 and 65535.

```ts
port({ default: 3000 })
```

### `bool(options?)`

Parses boolean strings: `"true"`, `"1"`, `"yes"` → `true`; `"false"`, `"0"`, `"no"` → `false`.

```ts
bool({ default: false })
```

### `url(options?)`

Validates URL format using the `URL` constructor.

```ts
url()
```

### `oneOf(values, options?)`

Restricts to a set of literal string values. Returns a union type.

```ts
oneOf(['debug', 'info', 'warn', 'error'] as const, { default: 'info' })
// Type: 'debug' | 'info' | 'warn' | 'error'
```

## Standard Schema

### Using envokay validators in Standard Schema consumers

Every envokay validator implements `StandardSchemaV1` from `@standard-schema/spec`. This means you can pass them directly to any tool that supports Standard Schema:

```ts
import { str } from 'envokay'

// Use in TanStack Form, tRPC, or any Standard Schema consumer
const nameValidator = str({ minLength: 1, maxLength: 100 })
// nameValidator['~standard'].validate('hello') → { value: 'hello' }
```

### Using external schemas inside `createEnv`

You can use any Standard Schema-compliant library (Zod, Valibot, ArkType) as a validator inside `createEnv`:

```ts
import { z } from 'zod'
import { createEnv, port } from 'envokay'

export const env = createEnv({
  PORT: port({ default: 3000 }),
  CORS_ORIGIN: z.string().url(),
})
```

Detection checks for the `~standard` property and uses its `validate` method automatically.

## Custom Env Source

By default, `createEnv` reads from `process.env`. You can pass a custom source:

```ts
const env = createEnv(
  { PORT: port(), HOST: str() },
  { PORT: '8080', HOST: 'localhost' },
)
```

## Error Output

When validation fails, envokay throws an `EnvValidationError` with a formatted message:

```
Environment variable validation failed:

  Missing variables:
    - DATABASE_URL: Required environment variable is not set
    - API_KEY: Required environment variable is not set

  Invalid variables:
    - PORT: Expected an integer port number, got "abc"
```

All errors are collected before throwing, so you see every problem at once.

### Sensitive Redaction

Variables marked `sensitive: true` are redacted in error messages and in `.toJSON()`:

```ts
const env = createEnv({
  API_KEY: str({ sensitive: true }),
}, { API_KEY: 'sk-secret-123' })

JSON.stringify(env) // { "API_KEY": "[REDACTED]" }
```

## Runtime Support

envokay uses no Node-specific APIs. It works in:

- Node.js
- Bun
- Cloudflare Workers
- Edge runtimes

## License

[MIT](./LICENSE)
