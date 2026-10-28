import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { fetchAdminUsersApi, getAuthCookieHeader, getErrorMessage } from "@/lib/api/auth-proxy";
import { clearSessionCookie } from "@/lib/session";

export const MONGO_OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export async function proxyAdminUserMutation(request: NextRequest, id: string, path: string, method: "PATCH" | "POST", body?: object): Promise<NextResponse> {
	const csrfToken = request.headers.get("X-CSRF-Token");
	const accessToken = request.cookies.get("session")?.value;

	if (!accessToken) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
	if (!csrfToken || !MONGO_OBJECT_ID_PATTERN.test(id)) return NextResponse.json({ message: "The user update request is invalid." }, { status: 400 });

	try {
		const backendResponse = await fetchAdminUsersApi(`${encodeURIComponent(id)}/${path}`, {
			method,
			headers: { ...(body ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${accessToken}`, Cookie: getAuthCookieHeader(request), "X-CSRF-Token": csrfToken },
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!backendResponse.ok) {
			const response = NextResponse.json({ message: await getErrorMessage(backendResponse, "Unable to update the user.") }, { status: backendResponse.status });
			if (backendResponse.status === 401) clearSessionCookie(response);
			return response;
		}

		return new NextResponse(null, { status: 204 });
	} catch {
		return NextResponse.json({ message: "Unable to reach the user-management server." }, { status: 502 });
	}
}
