import type { BaseValidatorOptions } from "../types.ts";
import { createValidator } from "./base.ts";

export interface StrOptions extends BaseValidatorOptions<string> {
	minLength?: number;
	maxLength?: number;
	pattern?: RegExp;
}

export function str(options: StrOptions = {}) {
	return createValidator<string>((value) => {
		if (
			options.minLength !== undefined &&
			value.length < options.minLength
		) {
			throw new Error(
				`String must be at least ${options.minLength} characters`,
			);
		}
		if (
			options.maxLength !== undefined &&
			value.length > options.maxLength
		) {
			throw new Error(
				`String must be at most ${options.maxLength} characters`,
			);
		}
		if (options.pattern && !options.pattern.test(value)) {
			throw new Error(
				`String does not match pattern ${options.pattern}`,
			);
		}
		return value;
	}, options);
}
