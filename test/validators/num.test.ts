import { describe, expect, test } from "bun:test";
import { num } from "../../src/validators/num.ts";

describe("num validator", () => {
	test("parses a valid integer", () => {
		const v = num();
		expect(v.parse("42")).toBe(42);
	});

	test("parses a valid float", () => {
		const v = num();
		expect(v.parse("3.14")).toBe(3.14);
	});

	test("parses negative numbers", () => {
		const v = num();
		expect(v.parse("-10")).toBe(-10);
	});

	test("throws on non-numeric string", () => {
		const v = num();
		expect(() => v.parse("abc")).toThrow('Expected a number, got "abc"');
	});

	test("enforces min", () => {
		const v = num({ min: 0 });
		expect(v.parse("5")).toBe(5);
		expect(() => v.parse("-1")).toThrow("at least 0");
	});

	test("enforces max", () => {
		const v = num({ max: 10 });
		expect(v.parse("5")).toBe(5);
		expect(() => v.parse("11")).toThrow("at most 10");
	});

	test("enforces both min and max", () => {
		const v = num({ min: 0, max: 10 });
		expect(v.parse("5")).toBe(5);
		expect(() => v.parse("-1")).toThrow("at least 0");
		expect(() => v.parse("11")).toThrow("at most 10");
	});

	test("respects default value via ~standard.validate", () => {
		const v = num({ default: 42 });
		const result = v["~standard"].validate(undefined);
		expect(result).toEqual({ value: 42 });
	});
});
