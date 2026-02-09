import type { BaseValidatorOptions } from "../types.js";
import { createValidator } from "./base.js";

export interface PortOptions extends BaseValidatorOptions<number> {}

export function port(options: PortOptions = {}) {
	return createValidator<number>((value) => {
		const n = Number(value);
		if (!Number.isInteger(n)) {
			throw new Error(`Expected an integer port number, got "${value}"`);
		}
		if (n < 1 || n > 65535) {
			throw new Error(
				`Port must be between 1 and 65535, got ${n}`,
			);
		}
		return n;
	}, options);
}
