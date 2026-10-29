import { NextRequest, NextResponse } from "next/server";
import { copySetCookieHeaders, fetchAuthApi, getAuthCookieHeader, getErrorMessage, parseAuthResponse } from "@/lib/api/auth-proxy";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
	const csrfToken = request.headers.get("X-CSRF-Token");

	if (!csrfToken) {
		return NextResponse.json({ message: "Missing CSRF token." }, { status: 400 });
	}

	try {
		const backendResponse = await fetchAuthApi("refresh", {
			method: "POST",
			headers: {
				Cookie: getAuthCookieHeader(request),
				"X-CSRF-Token": csrfToken,
				"User-Agent": request.headers.get("user-agent")?.slice(0, 512) || "Unknown browser",
			},
		});

		if (!backendResponse.ok) {
			const response = NextResponse.json(
				{ message: await getErrorMessage(backendResponse, "Unable to refresh the session.") },
				{ status: backendResponse.status },
			);

			if (backendResponse.status === 401) clearSessionCookie(response);
			copySetCookieHeaders(backendResponse, response);

			return response;
		}

		const session = await parseAuthResponse(backendResponse);
		const response = NextResponse.json({ refreshed: true });
		setSessionCookie(response, session.token, session.expiresAt);
		copySetCookieHeaders(backendResponse, response);
		return response;
	} catch {
		return NextResponse.json({ message: "Unable to reach the authentication server." }, { status: 502 });
	}
}
