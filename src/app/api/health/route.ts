import { checkApiHealth } from "@/lib/api/client";

export async function GET() {
	try {
		const healthy = await checkApiHealth();

		return Response.json(
			{ backend: healthy ? "connected" : "unhealthy" },
			{ status: healthy ? 200 : 503 },
		);
	} catch {
		return Response.json(
			{ backend: "unreachable" },
			{ status: 503 },
		);
	}
}