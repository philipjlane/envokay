import type { BaseValidatorOptions } from "../types.js";
import { createValidator } from "./base.js";

export interface BoolOptions extends BaseValidatorOptions<boolean> {}

const TRUE_VALUES = new Set(["true", "1", "yes"]);
const FALSE_VALUES = new Set(["false", "0", "no"]);

export function bool(options: BoolOptions = {}) {
	return createValidator<boolean>((value) => {
		const lower = value.toLowerCase();
		if (TRUE_VALUES.has(lower)) return true;
		if (FALSE_VALUES.has(lower)) return false;
		throw new Error(
			`Expected a boolean (true/false/1/0/yes/no), got "${value}"`,
		);
	}, options);
}
