import type { StandardSchemaV1 } from "@standard-schema/spec";

/** Options common to all validators. */
export interface BaseValidatorOptions<T> {
	/** Default value if the env var is not set. */
	default?: T;
	/** If true, the value is redacted in error messages and toJSON. */
	sensitive?: boolean;
}

/** An envokay validator descriptor that implements StandardSchemaV1. */
export interface EnvValidator<T> extends StandardSchemaV1<unknown, T> {
	readonly _envokay: true;
	readonly _default?: T;
	readonly _sensitive: boolean;
	/** Parse a raw string value into the validated type. */
	parse(value: string): T;
}

/** Schema config passed to createEnv: maps env var names to validators or Standard Schema schemas. */
export type EnvSchema = Record<string, EnvValidator<unknown> | StandardSchemaV1>;

/** Infer the output type of a single schema entry. */
export type InferFieldType<V> = V extends EnvValidator<infer T>
	? T
	: V extends StandardSchemaV1<unknown, infer T>
		? T
		: never;

/** Check if a schema entry has a default value. */
type HasDefault<V> = V extends EnvValidator<unknown>
	? V extends { readonly _default: unknown }
		? true
		: false
	: false;

/** Keys of the schema that have no default (required). */
type RequiredKeys<S extends EnvSchema> = {
	[K in keyof S]: HasDefault<S[K]> extends true ? never : K;
}[keyof S];

/** Keys of the schema that have a default (optional). */
type OptionalKeys<S extends EnvSchema> = {
	[K in keyof S]: HasDefault<S[K]> extends true ? K : never;
}[keyof S];

/** The inferred env result type from a schema definition. */
export type InferEnv<S extends EnvSchema> = {
	readonly [K in RequiredKeys<S> & string]: InferFieldType<S[K]>;
} & {
	readonly [K in OptionalKeys<S> & string]: InferFieldType<S[K]>;
};
