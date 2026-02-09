import { createEnv, str, num, oneOf } from "envokay";

const env = createEnv({
	WEATHER_API_KEY: str({ sensitive: true }),
	WEATHER_CITY: str({ default: "London" }),
	WEATHER_UNITS: oneOf(["metric", "imperial", "standard"] as const, {
		default: "metric",
	}),
	WEATHER_TIMEOUT: num({ min: 1000, max: 30000, default: 5000 }),
});

// Parse CLI args for city override
const cityArg = process.argv.indexOf("--city");
const city =
	cityArg !== -1 && process.argv[cityArg + 1]
		? process.argv[cityArg + 1]
		: env.WEATHER_CITY;

console.log(`Fetching weather for ${city} (units: ${env.WEATHER_UNITS})...`);

// Safe to log — sensitive values are redacted
console.log("Config:", JSON.stringify(env));

try {
	const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${env.WEATHER_UNITS}&appid=${env.WEATHER_API_KEY}`;
	const res = await fetch(url, {
		signal: AbortSignal.timeout(env.WEATHER_TIMEOUT),
	});

	if (!res.ok) {
		console.error(`API error: ${res.status} ${res.statusText}`);
		process.exit(1);
	}

	const data = (await res.json()) as {
		name: string;
		main: { temp: number; humidity: number };
		weather: { description: string }[];
	};
	const unitLabel = env.WEATHER_UNITS === "imperial" ? "°F" : "°C";

	console.log(`\n${data.name}:`);
	console.log(`  ${data.weather[0]?.description}`);
	console.log(`  Temperature: ${data.main.temp}${unitLabel}`);
	console.log(`  Humidity: ${data.main.humidity}%`);
} catch (err) {
	if (err instanceof Error && err.name === "TimeoutError") {
		console.error(`Request timed out after ${env.WEATHER_TIMEOUT}ms`);
	} else {
		console.error("Failed to fetch weather:", err);
	}
	process.exit(1);
}
