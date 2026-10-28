import { NextRequest, NextResponse } from "next/server";
import { fetchAuthApi, getErrorMessage } from "@/lib/api/auth-proxy";
import { clearSessionCookie } from "@/lib/session";

export async function GET(request: NextRequest) {
	const accessToken = request.cookies.get("session")?.value;

	if (!accessToken) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });

	try {
		const backendResponse = await fetchAuthApi("sessions", { headers: { Authorization: `Bearer ${accessToken}` } });

		if (!backendResponse.ok) {
			const response = NextResponse.json({ message: await getErrorMessage(backendResponse, "Unable to load active sessions.") }, { status: backendResponse.status });
			if (backendResponse.status === 401) clearSessionCookie(response);
			return response;
		}

		return NextResponse.json(await backendResponse.json(), { status: 200, headers: { "Cache-Control": "no-store" } });
	} catch {
		return NextResponse.json({ message: "Unable to reach the authentication server." }, { status: 502 });
	}
}
