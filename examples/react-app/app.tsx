import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

interface Post {
	id: number;
	title: string;
	body: string;
}

function App() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/posts")
			.then((res) => res.json())
			.then((data) => {
				setPosts(data as Post[]);
				setLoading(false);
			});
	}, []);

	return (
		<div style={{ maxWidth: 640, margin: "2rem auto", fontFamily: "system-ui" }}>
			<h1>envokay + React Example</h1>
			<p>
				This server is configured using environment variables validated by{" "}
				<code>envokay</code>. Check <code>env.ts</code> to see the schema.
			</p>
			<h2>Posts from API</h2>
			{loading ? (
				<p>Loading...</p>
			) : (
				<ul>
					{posts.map((post) => (
						<li key={post.id}>
							<strong>{post.title}</strong>
							<p>{post.body}</p>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
