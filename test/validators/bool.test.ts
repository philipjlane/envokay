import { describe, expect, test } from "bun:test";
import { bool } from "../../src/validators/bool.ts";

describe("bool validator", () => {
	test('parses "true"', () => {
		const v = bool();
		expect(v.parse("true")).toBe(true);
	});

	test('parses "TRUE"', () => {
		const v = bool();
		expect(v.parse("TRUE")).toBe(true);
	});

	test('parses "1"', () => {
		const v = bool();
		expect(v.parse("1")).toBe(true);
	});

	test('parses "yes"', () => {
		const v = bool();
		expect(v.parse("yes")).toBe(true);
	});

	test('parses "false"', () => {
		const v = bool();
		expect(v.parse("false")).toBe(false);
	});

	test('parses "FALSE"', () => {
		const v = bool();
		expect(v.parse("FALSE")).toBe(false);
	});

	test('parses "0"', () => {
		const v = bool();
		expect(v.parse("0")).toBe(false);
	});

	test('parses "no"', () => {
		const v = bool();
		expect(v.parse("no")).toBe(false);
	});

	test("throws on invalid value", () => {
		const v = bool();
		expect(() => v.parse("maybe")).toThrow("Expected a boolean");
	});

	test("respects default value via ~standard.validate", () => {
		const v = bool({ default: false });
		const result = v["~standard"].validate(undefined);
		expect(result).toEqual({ value: false });
	});
});
