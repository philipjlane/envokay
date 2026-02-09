import type { BaseValidatorOptions } from "../types.js";
import { createValidator } from "./base.js";

export interface UrlOptions extends BaseValidatorOptions<string> {}

export function url(options: UrlOptions = {}) {
	return createValidator<string>((value) => {
		try {
			new URL(value);
		} catch {
			throw new Error(`Invalid URL: "${value}"`);
		}
		return value;
	}, options);
}
