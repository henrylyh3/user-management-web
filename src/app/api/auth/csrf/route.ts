import { NextRequest, NextResponse } from "next/server";
import { copySetCookieHeaders, fetchAuthApi, getAuthCookieHeader } from "@/lib/api/auth-proxy";

export async function GET(request: NextRequest) {
	try {
		const backendResponse = await fetchAuthApi("csrf", {
			headers: { Cookie: getAuthCookieHeader(request) },
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
