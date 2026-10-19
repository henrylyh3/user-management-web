import "server-only";

export function getApiBaseUrl(): string {
	const baseUrl = process.env.API_BASE_URL;

	if (!baseUrl) {
		throw new Error("API_BASE_URL is not configured.");
	}

	// remove trailing slashes to prevent url such as http://localhost:5000//api/User.
	return baseUrl.replace(/\/+$/, "");
}

export async function checkApiHealth(): Promise<boolean> {
	const response = await fetch(`${getApiBaseUrl()}/health`, { cache: "no-store", signal: AbortSignal.timeout(5000),});

	return response.ok;
}
