import { describe, expect, test } from "bun:test";
import { port } from "../../src/validators/port.ts";

describe("port validator", () => {
	test("parses a valid port", () => {
		const v = port();
		expect(v.parse("8080")).toBe(8080);
	});

	test("parses port 1 (minimum)", () => {
		const v = port();
		expect(v.parse("1")).toBe(1);
	});

	test("parses port 65535 (maximum)", () => {
		const v = port();
		expect(v.parse("65535")).toBe(65535);
	});

	test("throws on port 0", () => {
		const v = port();
		expect(() => v.parse("0")).toThrow("between 1 and 65535");
	});

	test("throws on port > 65535", () => {
		const v = port();
		expect(() => v.parse("70000")).toThrow("between 1 and 65535");
	});

	test("throws on negative port", () => {
		const v = port();
		expect(() => v.parse("-1")).toThrow("between 1 and 65535");
	});

	test("throws on non-integer", () => {
		const v = port();
		expect(() => v.parse("3.14")).toThrow("integer");
	});

	test("throws on non-numeric string", () => {
		const v = port();
		expect(() => v.parse("abc")).toThrow("integer");
	});

	test("respects default value via ~standard.validate", () => {
		const v = port({ default: 3000 });
		const result = v["~standard"].validate(undefined);
		expect(result).toEqual({ value: 3000 });
	});
});
