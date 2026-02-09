import index from "./index.html";
import { env } from "./env.ts";

Bun.serve({
	port: env.PORT,
	routes: {
		"/": index,
		"/api/config": {
			GET: () => {
				// Safe to expose — SESSION_SECRET is redacted via toJSON
				return Response.json({
					apiUrl: env.API_URL,
					analyticsEnabled: env.ENABLE_ANALYTICS,
				});
			},
		},
		"/api/posts": {
			GET: async () => {
				const res = await fetch(`${env.API_URL}/posts?_limit=5`);
				const posts = await res.json();
				return Response.json(posts);
			},
		},
	},
	development: {
		hmr: true,
		console: true,
	},
});

console.log(`Server running at http://localhost:${env.PORT}`);
