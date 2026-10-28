import { NextRequest, NextResponse } from "next/server";
import { copySetCookieHeaders, fetchAuthApi, getAuthCookieHeader, getErrorMessage } from "@/lib/api/auth-proxy";
import { clearSessionCookie, getSessionToken } from "@/lib/session";

export async function POST(request: NextRequest) {
	const csrfToken = request.headers.get("X-CSRF-Token");
	const token = await getSessionToken();

	if (!csrfToken) {
		return NextResponse.json({ message: "Missing CSRF token." }, { status: 400 });
	}

	if (!token) {
		const response = NextResponse.json({ message: "Please sign in again." }, { status: 401 });
		clearSessionCookie(response);
		return response;
	}

	try {
		const backendResponse = await fetchAuthApi("signout-all", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				Cookie: getAuthCookieHeader(request),
				"X-CSRF-Token": csrfToken,
			},
		});

		if (!backendResponse.ok) {
			const response = NextResponse.json(
				{ message: await getErrorMessage(backendResponse, "Unable to sign out all sessions.") },
				{ status: backendResponse.status },
			);

			if (backendResponse.status === 401) clearSessionCookie(response);

			return response;
		}

		const response = new NextResponse(null, { status: 204 });
		clearSessionCookie(response);
		copySetCookieHeaders(backendResponse, response);
		return response;
	} catch {
		return NextResponse.json({ message: "Unable to reach the authentication server." }, { status: 502 });
	}
}
