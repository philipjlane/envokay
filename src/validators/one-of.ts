import type { BaseValidatorOptions } from "../types.js";
import { createValidator } from "./base.js";

export interface OneOfOptions<T extends string> extends BaseValidatorOptions<T> {}

export function oneOf<const T extends readonly string[]>(
	values: T,
	options: OneOfOptions<T[number]> = {},
) {
	return createValidator<T[number]>((value) => {
		if (!values.includes(value)) {
			throw new Error(
				`Expected one of [${values.join(", ")}], got "${value}"`,
			);
		}
		return value as T[number];
	}, options);
}
