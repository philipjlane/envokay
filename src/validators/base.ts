import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { BaseValidatorOptions, EnvValidator } from "../types.js";

/** Create an envokay validator that implements StandardSchemaV1. */
export function createValidator<T>(
	parseFn: (value: string) => T,
	options: BaseValidatorOptions<T> = {},
): EnvValidator<T> {
	const validate = (
		value: unknown,
	): StandardSchemaV1.Result<T> => {
		if (typeof value !== "string") {
			if (value === undefined || value === null || value === "") {
				if ("default" in options && options.default !== undefined) {
					return { value: options.default };
				}
				return {
					issues: [{ message: "Value is required" }],
				};
			}
			return {
				issues: [{ message: `Expected a string, got ${typeof value}` }],
			};
		}
		try {
			return { value: parseFn(value) };
		} catch (err) {
			return {
				issues: [
					{
						message:
							err instanceof Error ? err.message : String(err),
					},
				],
			};
		}
	};

	const validator: EnvValidator<T> = {
		_envokay: true as const,
		_sensitive: options.sensitive ?? false,
		parse: parseFn,
		"~standard": {
			version: 1 as const,
			vendor: "envokay",
			validate,
			types: {} as StandardSchemaV1.Types<unknown, T>,
		},
	};

	if ("default" in options && options.default !== undefined) {
		return Object.assign(validator, {
			_default: options.default,
		});
	}

	return validator;
}
