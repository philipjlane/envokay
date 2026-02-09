import { createEnv, port, url, str, bool } from "envokay";

export const env = createEnv({
	PORT: port({ default: 3000 }),
	API_URL: url(),
	SESSION_SECRET: str({ sensitive: true, minLength: 8 }),
	ENABLE_ANALYTICS: bool({ default: false }),
});
