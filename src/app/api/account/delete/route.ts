import { NextRequest, NextResponse } from "next/server";
import { copySetCookieHeaders, fetchAccountApi, getAuthCookieHeader, getErrorMessage } from "@/lib/api/auth-proxy";
import { clearSessionCookie } from "@/lib/session";

function isDeleteAccountRequest(value: unknown): value is { currentPassword: string } {
	return typeof value === "object" && value !== null && "currentPassword" in value && typeof value.currentPassword === "string" && value.currentPassword.length >= 8 && value.currentPassword.length <= 128;
}

export async function DELETE(request: NextRequest) {
	const csrfToken = request.headers.get("X-CSRF-Token");
	const accessToken = request.cookies.get("session")?.value;
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ message: "Invalid account-deletion request." }, { status: 400 });
	}

	if (!accessToken) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
	if (!csrfToken || !isDeleteAccountRequest(body)) return NextResponse.json({ message: "The account-deletion request is invalid." }, { status: 400 });

	try {
		const backendResponse = await fetchAccountApi("", {
			method: "DELETE",
			headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, Cookie: getAuthCookieHeader(request), "X-CSRF-Token": csrfToken },
			body: JSON.stringify(body),
		});

		if (!backendResponse.ok) {
			const response = NextResponse.json({ message: await getErrorMessage(backendResponse, "Unable to delete the account.") }, { status: backendResponse.status });
			if (backendResponse.status === 401) clearSessionCookie(response);
			copySetCookieHeaders(backendResponse, response);
			return response;
		}

		const response = new NextResponse(null, { status: 204 });
		clearSessionCookie(response);
		copySetCookieHeaders(backendResponse, response);
		return response;
	} catch {
		return NextResponse.json({ message: "Unable to reach the account server." }, { status: 502 });
	}
}
