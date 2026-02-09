import { createEnv, port, str, url, num, oneOf } from "envokay";

export const env = createEnv({
	PORT: port({ default: 4000 }),
	DATABASE_URL: url({ sensitive: true }),
	LOG_LEVEL: oneOf(["debug", "info", "warn", "error"] as const, {
		default: "info",
	}),
	CORS_ORIGIN: str({ default: "http://localhost:3000" }),
	RATE_LIMIT_MAX: num({ min: 1, max: 10000, default: 100 }),
});
