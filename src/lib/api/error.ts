function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function readString(value: Record<string, unknown>, property: string): string | null {
	const result = value[property];
	return typeof result === "string" && result.trim() ? result : null;
}

export async function getApiErrorMessage(response: Response, fallback: string): Promise<string> {
	if (!response.headers.get("content-type")?.includes("json")) return fallback;

	try {
		const data: unknown = await response.json();

		if (!isObject(data)) return fallback;

		return readString(data, "detail") ?? readString(data, "message") ?? readString(data, "title") ?? fallback;
	} catch {
		return fallback;
	}
}
