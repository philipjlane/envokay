import { describe, expect, test } from "bun:test";
import { url } from "../../src/validators/url.ts";

describe("url validator", () => {
	test("parses a valid HTTP URL", () => {
		const v = url();
		expect(v.parse("https://example.com")).toBe("https://example.com");
	});

	test("parses a valid URL with path", () => {
		const v = url();
		expect(v.parse("https://example.com/path?q=1")).toBe(
			"https://example.com/path?q=1",
		);
	});

	test("parses a postgres connection URL", () => {
		const v = url();
		expect(v.parse("postgres://user:pass@localhost:5432/db")).toBe(
			"postgres://user:pass@localhost:5432/db",
		);
	});

	test("throws on invalid URL", () => {
		const v = url();
		expect(() => v.parse("not-a-url")).toThrow("Invalid URL");
	});

	test("throws on empty-ish input", () => {
		const v = url();
		expect(() => v.parse("://")).toThrow("Invalid URL");
	});

	test("respects default value via ~standard.validate", () => {
		const v = url({ default: "https://default.com" });
		const result = v["~standard"].validate(undefined);
		expect(result).toEqual({ value: "https://default.com" });
	});
});
