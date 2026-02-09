import type { BaseValidatorOptions } from "../types.ts";
import { createValidator } from "./base.ts";

export interface NumOptions extends BaseValidatorOptions<number> {
	min?: number;
	max?: number;
}

export function num(options: NumOptions = {}) {
	return createValidator<number>((value) => {
		const n = Number(value);
		if (Number.isNaN(n)) {
			throw new Error(`Expected a number, got "${value}"`);
		}
		if (options.min !== undefined && n < options.min) {
			throw new Error(
				`Number must be at least ${options.min}, got ${n}`,
			);
		}
		if (options.max !== undefined && n > options.max) {
			throw new Error(
				`Number must be at most ${options.max}, got ${n}`,
			);
		}
		return n;
	}, options);
}
