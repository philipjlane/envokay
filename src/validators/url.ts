import type { BaseValidatorOptions } from "../types.ts";
import { createValidator } from "./base.ts";

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
