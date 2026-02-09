export interface EnvError {
	key: string;
	message: string;
	kind: "missing" | "invalid";
}

export class EnvValidationError extends Error {
	public readonly errors: ReadonlyArray<EnvError>;

	constructor(errors: EnvError[]) {
		const missing = errors.filter((e) => e.kind === "missing");
		const invalid = errors.filter((e) => e.kind === "invalid");

		const lines: string[] = ["Environment variable validation failed:", ""];

		if (missing.length > 0) {
			lines.push("  Missing variables:");
			for (const e of missing) {
				lines.push(`    - ${e.key}: ${e.message}`);
			}
			lines.push("");
		}

		if (invalid.length > 0) {
			lines.push("  Invalid variables:");
			for (const e of invalid) {
				lines.push(`    - ${e.key}: ${e.message}`);
			}
			lines.push("");
		}

		super(lines.join("\n"));
		this.name = "EnvValidationError";
		this.errors = errors;
	}
}
