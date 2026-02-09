import { describe, expect, test } from "bun:test";
import { str } from "../../src/validators/str.ts";

describe("str validator", () => {
	test("parses a valid string", () => {
		const v = str();
		expect(v.parse("hello")).toBe("hello");
	});

	test("parses empty string", () => {
		const v = str();
		expect(v.parse("")).toBe("");
	});

	test("enforces minLength", () => {
		const v = str({ minLength: 3 });
		expect(v.parse("abc")).toBe("abc");
		expect(() => v.parse("ab")).toThrow("at least 3 characters");
	});

	test("enforces maxLength", () => {
		const v = str({ maxLength: 5 });
		expect(v.parse("abc")).toBe("abc");
		expect(() => v.parse("abcdef")).toThrow("at most 5 characters");
	});

	test("enforces pattern", () => {
		const v = str({ pattern: /^[A-Z]+$/ });
		expect(v.parse("ABC")).toBe("ABC");
		expect(() => v.parse("abc")).toThrow("does not match pattern");
	});

	test("respects default value via ~standard.validate", () => {
		const v = str({ default: "fallback" });
		const result = v["~standard"].validate(undefined);
		expect(result).toEqual({ value: "fallback" });
	});

	test("returns issue when required and missing", () => {
		const v = str();
		const result = v["~standard"].validate(undefined);
		expect("issues" in result && result.issues).toBeTruthy();
	});
});
