import type { StandardSchemaV1 } from "@standard-schema/spec";
import { EnvValidationError } from "./errors.js";
import type { EnvError } from "./errors.js";
import type { EnvSchema, InferEnv } from "./types.js";
import { getDefaultEnvSource, isEnvValidator, isStandardSchema } from "./utils.js";

/**
 * Create a validated, type-safe, frozen env object.
 *
 * @param schema - A record of env var names to validators or Standard Schema schemas.
 * @param source - Optional custom env source (defaults to process.env).
 */
export function createEnv<S extends EnvSchema>(
	schema: S,
	source?: Record<string, string | undefined>,
): InferEnv<S> {
	const envSource = source ?? getDefaultEnvSource();
	const errors: EnvError[] = [];
	const result: Record<string, unknown> = {};

	for (const key of Object.keys(schema)) {
		const descriptor = schema[key];
		if (!descriptor) continue;

		const rawValue = envSource[key];

		if (isEnvValidator(descriptor)) {
			// Native envokay validator
			if (rawValue === undefined || rawValue === "") {
				if (descriptor._default !== undefined) {
					result[key] = descriptor._default;
					continue;
				}
				errors.push({
					key,
					message: "Required environment variable is not set",
					kind: "missing",
				});
				continue;
			}

			try {
				result[key] = descriptor.parse(rawValue);
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				errors.push({
					key,
					message: descriptor._sensitive
						? "Invalid value [REDACTED]"
						: message,
					kind: "invalid",
				});
			}
		} else if (isStandardSchema(descriptor)) {
			// External Standard Schema validator (Zod, Valibot, ArkType, etc.)
			const valueToValidate = rawValue === undefined ? rawValue : rawValue;
			const validationResult = descriptor["~standard"].validate(
				valueToValidate,
			);

			// Handle sync and async results
			if (validationResult instanceof Promise) {
				throw new Error(
					`Async validation is not supported for env var "${key}". Use a synchronous schema.`,
				);
			}

			if (validationResult.issues) {
				if (rawValue === undefined || rawValue === "") {
					errors.push({
						key,
						message: "Required environment variable is not set",
						kind: "missing",
					});
				} else {
					const message = validationResult.issues
						.map((issue) => issue.message)
						.join("; ");
					errors.push({
						key,
						message,
						kind: "invalid",
					});
				}
			} else {
				result[key] = validationResult.value;
			}
		}
	}

	if (errors.length > 0) {
		throw new EnvValidationError(errors);
	}

	// Create the frozen result with toJSON for sensitive fields
	const frozenResult: Record<string, unknown> = {};
	for (const key of Object.keys(schema)) {
		const descriptor = schema[key];
		if (!descriptor) continue;

		const value = result[key];
		const isSensitive =
			isEnvValidator(descriptor) && descriptor._sensitive;

		if (isSensitive) {
			Object.defineProperty(frozenResult, key, {
				value,
				enumerable: true,
				writable: false,
				configurable: false,
			});
		} else {
			frozenResult[key] = value;
		}
	}

	// Add toJSON that redacts sensitive fields
	Object.defineProperty(frozenResult, "toJSON", {
		value: () => {
			const json: Record<string, unknown> = {};
			for (const key of Object.keys(schema)) {
				const descriptor = schema[key];
				if (!descriptor) continue;
				const isSensitive =
					isEnvValidator(descriptor) && descriptor._sensitive;
				json[key] = isSensitive ? "[REDACTED]" : result[key];
			}
			return json;
		},
		enumerable: false,
		writable: false,
		configurable: false,
	});

	return Object.freeze(frozenResult) as InferEnv<S>;
}
