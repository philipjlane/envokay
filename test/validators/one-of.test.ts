import { describe, expect, test } from "bun:test";
import { oneOf } from "../../src/validators/one-of.ts";

describe("oneOf validator", () => {
	const levels = ["debug", "info", "warn", "error"] as const;

	test("parses a valid value", () => {
		const v = oneOf(levels);
		expect(v.parse("debug")).toBe("debug");
		expect(v.parse("error")).toBe("error");
	});

	test("throws on invalid value", () => {
		const v = oneOf(levels);
		expect(() => v.parse("trace")).toThrow(
			'Expected one of [debug, info, warn, error], got "trace"',
		);
	});

	test("is case-sensitive", () => {
		const v = oneOf(levels);
		expect(() => v.parse("DEBUG")).toThrow("Expected one of");
	});

	test("respects default value via ~standard.validate", () => {
		const v = oneOf(levels, { default: "info" });
		const result = v["~standard"].validate(undefined);
		expect(result).toEqual({ value: "info" });
	});
});
