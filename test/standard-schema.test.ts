import { describe, expect, test } from "bun:test";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { createEnv, str, num, port, bool, url, oneOf } from "../src/index.ts";

describe("Standard Schema compliance", () => {
	describe("~standard property shape", () => {
		const validators = [
			{ name: "str", v: str() },
			{ name: "num", v: num() },
			{ name: "port", v: port() },
			{ name: "bool", v: bool() },
			{ name: "url", v: url() },
			{ name: "oneOf", v: oneOf(["a", "b"] as const) },
		];

		for (const { name, v } of validators) {
			test(`${name} has ~standard property`, () => {
				expect(v["~standard"]).toBeDefined();
			});

			test(`${name} has version 1`, () => {
				expect(v["~standard"].version).toBe(1);
			});

			test(`${name} has vendor 'envokay'`, () => {
				expect(v["~standard"].vendor).toBe("envokay");
			});

			test(`${name} has validate function`, () => {
				expect(typeof v["~standard"].validate).toBe("function");
			});
		}
	});

	describe("~standard.validate() results", () => {
		test("str returns success for valid input", () => {
			const v = str();
			const result = v["~standard"].validate("hello");
			expect("value" in result).toBe(true);
			if ("value" in result) {
				expect(result.value).toBe("hello");
			}
		});

		test("str returns failure for non-string input", () => {
			const v = str();
			const result = v["~standard"].validate(123);
			expect("issues" in result && result.issues).toBeTruthy();
		});

		test("str with minLength returns failure", () => {
			const v = str({ minLength: 5 });
			const result = v["~standard"].validate("hi");
			expect("issues" in result && result.issues).toBeTruthy();
		});

		test("num returns success for valid number string", () => {
			const v = num();
			const result = v["~standard"].validate("42");
			expect("value" in result).toBe(true);
			if ("value" in result) {
				expect(result.value).toBe(42);
			}
		});

		test("num returns failure for invalid input", () => {
			const v = num();
			const result = v["~standard"].validate("abc");
			expect("issues" in result && result.issues).toBeTruthy();
		});

		test("port returns success for valid port", () => {
			const v = port();
			const result = v["~standard"].validate("8080");
			expect("value" in result).toBe(true);
			if ("value" in result) {
				expect(result.value).toBe(8080);
			}
		});

		test("port returns failure for out of range", () => {
			const v = port();
			const result = v["~standard"].validate("70000");
			expect("issues" in result && result.issues).toBeTruthy();
		});

		test("bool returns success for truthy values", () => {
			const v = bool();
			for (const val of ["true", "1", "yes"]) {
				const result = v["~standard"].validate(val);
				expect("value" in result).toBe(true);
				if ("value" in result) {
					expect(result.value).toBe(true);
				}
			}
		});

		test("bool returns success for falsy values", () => {
			const v = bool();
			for (const val of ["false", "0", "no"]) {
				const result = v["~standard"].validate(val);
				expect("value" in result).toBe(true);
				if ("value" in result) {
					expect(result.value).toBe(false);
				}
			}
		});

		test("url returns success for valid URL", () => {
			const v = url();
			const result = v["~standard"].validate("https://example.com");
			expect("value" in result).toBe(true);
			if ("value" in result) {
				expect(result.value).toBe("https://example.com");
			}
		});

		test("url returns failure for invalid URL", () => {
			const v = url();
			const result = v["~standard"].validate("not-a-url");
			expect("issues" in result && result.issues).toBeTruthy();
		});

		test("oneOf returns success for valid value", () => {
			const v = oneOf(["a", "b"] as const);
			const result = v["~standard"].validate("a");
			expect("value" in result).toBe(true);
			if ("value" in result) {
				expect(result.value).toBe("a");
			}
		});

		test("oneOf returns failure for invalid value", () => {
			const v = oneOf(["a", "b"] as const);
			const result = v["~standard"].validate("c");
			expect("issues" in result && result.issues).toBeTruthy();
		});

		test("default value is returned when input is undefined", () => {
			const v = str({ default: "fallback" });
			const result = v["~standard"].validate(undefined);
			expect("value" in result).toBe(true);
			if ("value" in result) {
				expect(result.value).toBe("fallback");
			}
		});

		test("issue has message property", () => {
			const v = num();
			const result = v["~standard"].validate("abc");
			if ("issues" in result && result.issues) {
				expect(result.issues.length).toBeGreaterThan(0);
				expect(typeof result.issues[0]?.message).toBe("string");
			}
		});
	});

	describe("external Standard Schema validators with createEnv", () => {
		test("works with a minimal Standard Schema compliant validator", () => {
			// Mock a minimal Standard Schema compliant string validator
			const mockStringSchema: StandardSchemaV1<unknown, string> = {
				"~standard": {
					version: 1,
					vendor: "mock",
					validate(value: unknown) {
						if (typeof value === "string" && value.length > 0) {
							return { value };
						}
						return {
							issues: [{ message: "Expected a non-empty string" }],
						};
					},
				},
			};

			const env = createEnv(
				{
					MY_VAR: mockStringSchema,
				},
				{
					MY_VAR: "hello",
				},
			);

			expect(env.MY_VAR).toBe("hello");
		});

		test("external schema validation errors are reported", () => {
			const mockNumberSchema: StandardSchemaV1<unknown, number> = {
				"~standard": {
					version: 1,
					vendor: "mock",
					validate(value: unknown) {
						const n = Number(value);
						if (Number.isNaN(n)) {
							return {
								issues: [{ message: "Expected a number" }],
							};
						}
						return { value: n };
					},
				},
			};

			expect(() =>
				createEnv(
					{
						COUNT: mockNumberSchema,
					},
					{
						COUNT: "not-a-number",
					},
				),
			).toThrow("Expected a number");
		});

		test("missing value with external schema", () => {
			const mockSchema: StandardSchemaV1<unknown, string> = {
				"~standard": {
					version: 1,
					vendor: "mock",
					validate(value: unknown) {
						if (typeof value !== "string" || value === "") {
							return {
								issues: [{ message: "Required" }],
							};
						}
						return { value };
					},
				},
			};

			expect(() =>
				createEnv(
					{
						MISSING_VAR: mockSchema,
					},
					{},
				),
			).toThrow("Missing");
		});

		test("mixing native and external validators", () => {
			const mockSchema: StandardSchemaV1<unknown, string> = {
				"~standard": {
					version: 1,
					vendor: "mock",
					validate(value: unknown) {
						if (typeof value === "string" && value.startsWith("https://")) {
							return { value };
						}
						return {
							issues: [{ message: "Must start with https://" }],
						};
					},
				},
			};

			const env = createEnv(
				{
					PORT: port({ default: 3000 }),
					ORIGIN: mockSchema,
				},
				{
					ORIGIN: "https://example.com",
				},
			);

			expect(env.PORT).toBe(3000);
			expect(env.ORIGIN).toBe("https://example.com");
		});
	});
});
