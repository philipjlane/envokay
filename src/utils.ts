import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { EnvValidator } from "./types.ts";

/** Check if a value is an envokay native validator. */
export function isEnvValidator(value: unknown): value is EnvValidator<unknown> {
	return (
		typeof value === "object" &&
		value !== null &&
		"_envokay" in value &&
		(value as EnvValidator<unknown>)._envokay === true
	);
}

/** Check if a value implements StandardSchemaV1. */
export function isStandardSchema(
	value: unknown,
): value is StandardSchemaV1 {
	return (
		typeof value === "object" &&
		value !== null &&
		"~standard" in value &&
		typeof (value as StandardSchemaV1)["~standard"] === "object" &&
		(value as StandardSchemaV1)["~standard"] !== null &&
		typeof (value as StandardSchemaV1)["~standard"].validate === "function"
	);
}

/** Get the default env source (process.env or empty object). */
export function getDefaultEnvSource(): Record<string, string | undefined> {
	return (globalThis as Record<string, unknown>).process
		? ((globalThis as Record<string, unknown>).process as { env: Record<string, string | undefined> }).env
		: {};
}
