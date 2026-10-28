import { NextRequest, NextResponse } from "next/server";
import { copySetCookieHeaders, fetchAccountApi, getAuthCookieHeader, getErrorMessage } from "@/lib/api/auth-proxy";
import { clearSessionCookie } from "@/lib/session";

function isChangePasswordRequest(value: unknown): value is { currentPassword: string; newPassword: string } {
	return typeof value === "object" && value !== null && "currentPassword" in value && typeof value.currentPassword === "string" && value.currentPassword.length >= 8 && value.currentPassword.length <= 128 && "newPassword" in value && typeof value.newPassword === "string" && value.newPassword.length >= 8 && value.newPassword.length <= 128;
}

export async function POST(request: NextRequest) {
	const csrfToken = request.headers.get("X-CSRF-Token");
	const accessToken = request.cookies.get("session")?.value;
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ message: "Invalid password-change request." }, { status: 400 });
	}

	if (!csrfToken || !accessToken || !isChangePasswordRequest(body)) {
		return NextResponse.json({ message: "The password-change request is invalid or the session expired." }, { status: accessToken ? 400 : 401 });
	}

	try {
		const backendResponse = await fetchAccountApi("change-password", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
				Cookie: getAuthCookieHeader(request),
				"X-CSRF-Token": csrfToken,
			},
			body: JSON.stringify(body),
		});

		if (!backendResponse.ok) {
			const response = NextResponse.json({ message: await getErrorMessage(backendResponse, "Unable to change the password.") }, { status: backendResponse.status });
			if (backendResponse.status === 401) clearSessionCookie(response);
			copySetCookieHeaders(backendResponse, response);
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
