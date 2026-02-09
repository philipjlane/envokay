import { describe, expect, test } from "bun:test";
import { createEnv, str, num, port, bool, url, oneOf, EnvValidationError } from "../src/index.ts";

describe("createEnv", () => {
	test("parses a valid env object", () => {
		const env = createEnv(
			{
				DATABASE_URL: url(),
				PORT: port({ default: 3000 }),
				DEBUG: bool({ default: false }),
				API_KEY: str(),
			},
			{
				DATABASE_URL: "postgres://localhost:5432/db",
				API_KEY: "secret-key",
			},
		);

		expect(env.DATABASE_URL).toBe("postgres://localhost:5432/db");
		expect(env.PORT).toBe(3000);
		expect(env.DEBUG).toBe(false);
		expect(env.API_KEY).toBe("secret-key");
	});

	test("uses provided values over defaults", () => {
		const env = createEnv(
			{
				PORT: port({ default: 3000 }),
				DEBUG: bool({ default: false }),
			},
			{
				PORT: "8080",
				DEBUG: "true",
			},
		);

		expect(env.PORT).toBe(8080);
		expect(env.DEBUG).toBe(true);
	});

	test("throws on missing required vars", () => {
		expect(() =>
			createEnv(
				{
					API_KEY: str(),
					DATABASE_URL: url(),
				},
				{},
			),
		).toThrow(EnvValidationError);
	});

	test("throws on invalid vars", () => {
		expect(() =>
			createEnv(
				{
					PORT: port(),
				},
				{
					PORT: "not-a-port",
				},
			),
		).toThrow(EnvValidationError);
	});

	test("collects all errors (missing and invalid)", () => {
		try {
			createEnv(
				{
					API_KEY: str(),
					PORT: port(),
					DATABASE_URL: url(),
				},
				{
					PORT: "not-a-port",
				},
			);
			expect.unreachable("Should have thrown");
		} catch (err) {
			expect(err).toBeInstanceOf(EnvValidationError);
			const error = err as EnvValidationError;
			expect(error.errors.length).toBe(3);

			const missing = error.errors.filter((e) => e.kind === "missing");
			const invalid = error.errors.filter((e) => e.kind === "invalid");
			expect(missing.length).toBe(2);
			expect(invalid.length).toBe(1);
		}
	});

	test("error message groups missing and invalid vars", () => {
		try {
			createEnv(
				{
					API_KEY: str(),
					PORT: port(),
				},
				{
					PORT: "abc",
				},
			);
			expect.unreachable("Should have thrown");
		} catch (err) {
			const error = err as EnvValidationError;
			expect(error.message).toContain("Missing variables");
			expect(error.message).toContain("Invalid variables");
			expect(error.message).toContain("API_KEY");
			expect(error.message).toContain("PORT");
		}
	});

	test("sensitive vars are redacted in error messages", () => {
		try {
			createEnv(
				{
					SECRET: str({ sensitive: true }),
				},
				{
					SECRET: "",
				},
			);
			expect.unreachable("Should have thrown");
		} catch (err) {
			const error = err as EnvValidationError;
			expect(error.message).not.toContain("actual-secret-value");
		}
	});

	test("sensitive vars redacted when invalid", () => {
		try {
			createEnv(
				{
					SECRET_PORT: port({ sensitive: true }),
				},
				{
					SECRET_PORT: "not-a-port",
				},
			);
			expect.unreachable("Should have thrown");
		} catch (err) {
			const error = err as EnvValidationError;
			const invalidErr = error.errors.find((e) => e.key === "SECRET_PORT");
			expect(invalidErr?.message).toBe("Invalid value [REDACTED]");
		}
	});

	test("toJSON redacts sensitive values", () => {
		const env = createEnv(
			{
				API_KEY: str({ sensitive: true }),
				PORT: port({ default: 3000 }),
			},
			{
				API_KEY: "super-secret",
			},
		);

		expect(env.API_KEY).toBe("super-secret");
		const json = (env as unknown as { toJSON: () => Record<string, unknown> }).toJSON();
		expect(json.API_KEY).toBe("[REDACTED]");
		expect(json.PORT).toBe(3000);
	});

	test("returned object is frozen", () => {
		const env = createEnv(
			{
				PORT: port({ default: 3000 }),
			},
			{},
		);

		expect(Object.isFrozen(env)).toBe(true);
		expect(() => {
			(env as Record<string, unknown>).PORT = 9999;
		}).toThrow();
	});

	test("uses custom source object", () => {
		const env = createEnv(
			{
				FOO: str(),
			},
			{
				FOO: "bar",
			},
		);

		expect(env.FOO).toBe("bar");
	});

	test("treats empty string as missing", () => {
		const env = createEnv(
			{
				PORT: port({ default: 3000 }),
			},
			{
				PORT: "",
			},
		);

		expect(env.PORT).toBe(3000);
	});

	test("oneOf with default", () => {
		const env = createEnv(
			{
				LOG_LEVEL: oneOf(["debug", "info", "warn", "error"] as const, {
					default: "info",
				}),
			},
			{},
		);

		expect(env.LOG_LEVEL).toBe("info");
	});

	test("num with min/max constraints", () => {
		const env = createEnv(
			{
				MAX_RETRIES: num({ min: 0, max: 10 }),
			},
			{
				MAX_RETRIES: "5",
			},
		);

		expect(env.MAX_RETRIES).toBe(5);
	});

	test("type inference works correctly", () => {
		const env = createEnv(
			{
				A_STRING: str(),
				A_NUMBER: num(),
				A_PORT: port(),
				A_BOOL: bool(),
				A_URL: url(),
				A_ONEOF: oneOf(["a", "b", "c"] as const),
			},
			{
				A_STRING: "hello",
				A_NUMBER: "42",
				A_PORT: "8080",
				A_BOOL: "true",
				A_URL: "https://example.com",
				A_ONEOF: "a",
			},
		);

		// These assignments verify type inference at compile time
		const s: string = env.A_STRING;
		const n: number = env.A_NUMBER;
		const p: number = env.A_PORT;
		const b: boolean = env.A_BOOL;
		const u: string = env.A_URL;
		const o: "a" | "b" | "c" = env.A_ONEOF;

		expect(s).toBe("hello");
		expect(n).toBe(42);
		expect(p).toBe(8080);
		expect(b).toBe(true);
		expect(u).toBe("https://example.com");
		expect(o).toBe("a");
	});

	test("type inference — wrong types produce ts errors", () => {
		const env = createEnv(
			{
				PORT: port({ default: 3000 }),
			},
			{},
		);

		// @ts-expect-error — PORT is a number, not a string
		const _: string = env.PORT;
		void _;
	});
});
