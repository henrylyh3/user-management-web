import { NextRequest, NextResponse } from "next/server";
import { copySetCookieHeaders, fetchAuthApi, getAuthCookieHeader } from "@/lib/api/auth-proxy";

export async function GET(request: NextRequest) {
	const authenticated = request.nextUrl.searchParams.get("authenticated") === "true";
	const accessToken = request.cookies.get("session")?.value;
	if (authenticated && !accessToken) return NextResponse.json({ message: "Please sign in again." }, { status: 401 });

	try {
		const headers = new Headers({ Cookie: getAuthCookieHeader(request) });
		if (authenticated) headers.set("Authorization", `Bearer ${accessToken}`);
		const backendResponse = await fetchAuthApi("csrf", {
			headers,
		});

		if (!backendResponse.ok) {
			return NextResponse.json({ message: "Unable to prepare the request." }, { status: backendResponse.status });
		}

		const data: unknown = await backendResponse.json();

		if (typeof data !== "object" || data === null || !("token" in data) || typeof data.token !== "string" || !data.token) {
			return NextResponse.json({ message: "Invalid CSRF response." }, { status: 502 });
		}

		const response = NextResponse.json({ token: data.token });
		copySetCookieHeaders(backendResponse, response);
		return response;
	} catch {
		return NextResponse.json({ message: "Unable to reach the authentication server." }, { status: 502 });
	}
}
