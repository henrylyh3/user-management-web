import { NextRequest, NextResponse } from "next/server";
import { copySetCookieHeaders, fetchAuthApi, getAuthCookieHeader, getErrorMessage } from "@/lib/api/auth-proxy";
import { clearSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
	const csrfToken = request.headers.get("X-CSRF-Token");

	if (!csrfToken) {
		return NextResponse.json({ message: "Missing CSRF token." }, { status: 400 });
	}

	try {
		const backendResponse = await fetchAuthApi("signout", {
			method: "POST",
			headers: {
				Cookie: getAuthCookieHeader(request),
				"X-CSRF-Token": csrfToken,
			},
		});

		if (!backendResponse.ok) {
			return NextResponse.json(
				{ message: await getErrorMessage(backendResponse, "Unable to sign out.") },
				{ status: backendResponse.status },
			);
		}

		const response = new NextResponse(null, { status: 204 });
		clearSessionCookie(response);
		copySetCookieHeaders(backendResponse, response);
		return response;
	} catch {
		return NextResponse.json({ message: "Unable to reach the authentication server." }, { status: 502 });
	}
}
