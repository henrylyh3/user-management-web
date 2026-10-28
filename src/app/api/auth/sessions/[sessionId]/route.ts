import { NextRequest, NextResponse } from "next/server";
import { copySetCookieHeaders, fetchAuthApi, getAuthCookieHeader, getErrorMessage } from "@/lib/api/auth-proxy";
import { clearSessionCookie } from "@/lib/session";

const SESSION_ID_PATTERN = /^[a-f\d]{32}$/i;

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
	const { sessionId } = await params;
	const csrfToken = request.headers.get("X-CSRF-Token");
	const accessToken = request.cookies.get("session")?.value;

	if (!accessToken) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
	if (!csrfToken || !SESSION_ID_PATTERN.test(sessionId)) return NextResponse.json({ message: "The session-revocation request is invalid." }, { status: 400 });

	try {
		const backendResponse = await fetchAuthApi(`sessions/${encodeURIComponent(sessionId)}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${accessToken}`, Cookie: getAuthCookieHeader(request), "X-CSRF-Token": csrfToken },
		});

		if (!backendResponse.ok) {
			const response = NextResponse.json({ message: await getErrorMessage(backendResponse, "Unable to revoke the session.") }, { status: backendResponse.status });
			if (backendResponse.status === 401) clearSessionCookie(response);
			copySetCookieHeaders(backendResponse, response);
			return response;
		}

		const data: unknown = await backendResponse.json();
		const revokedCurrentSession = typeof data === "object" && data !== null && "revokedCurrentSession" in data && data.revokedCurrentSession === true;
		const response = NextResponse.json({ revokedCurrentSession });
		if (revokedCurrentSession) clearSessionCookie(response);
		copySetCookieHeaders(backendResponse, response);
		return response;
	} catch {
		return NextResponse.json({ message: "Unable to reach the authentication server." }, { status: 502 });
	}
}
