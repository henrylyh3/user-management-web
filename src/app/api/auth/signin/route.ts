import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import { copySetCookieHeaders, fetchAuthApi, parseAuthResponse } from "@/lib/api/auth-proxy";
import { getUserHomePath, setSessionCookie } from "@/lib/session";

function isSignInRequest(value: unknown): value is { email: string; password: string; keepMeSignedIn: boolean; captchaToken?: string | null } {
	if (typeof value !== "object" || value === null) return false;

	return (
		"email" in value && typeof value.email === "string" && value.email.trim().length > 0 &&
		"password" in value && typeof value.password === "string" && value.password.length > 0 &&
		"keepMeSignedIn" in value && typeof value.keepMeSignedIn === "boolean" &&
		(!("captchaToken" in value) || value.captchaToken === null || (typeof value.captchaToken === "string" && value.captchaToken.length <= 2048))
	);
}

export async function POST(request: NextRequest) {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ message: "Invalid sign-in request." }, { status: 400 });
	}

	if (!isSignInRequest(body)) {
		return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
	}

	try {
		const backendResponse = await fetchAuthApi("signin", {
			method: "POST",
			headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("user-agent")?.slice(0, 512) || "Unknown browser" },
			body: JSON.stringify({ ...body, email: body.email.trim() }),
		});

		if (!backendResponse.ok) {
			const fallback = backendResponse.status === 429 ? "Too many sign-in attempts. Please wait and try again." : "Sign in failed.";
			const error = await readBackendError(backendResponse, fallback);
			return NextResponse.json(error, { status: backendResponse.status });
		}

		const session = await parseAuthResponse(backendResponse);
		const user = await getCurrentUser(session.token);

		if (!user?.isAuthenticated) {
			return NextResponse.json({ message: "Unable to verify the signed-in user." }, { status: 502 });
		}

		const response = NextResponse.json({ redirectTo: getUserHomePath(user) });
		setSessionCookie(response, session.token, session.expiresAt);
		copySetCookieHeaders(backendResponse, response);
		return response;
	} catch {
		return NextResponse.json({ message: "Unable to reach the authentication server." }, { status: 502 });
	}
}

async function readBackendError(response: Response, fallback: string): Promise<{ message: string; captchaRequired: boolean }> {
	try {
		const data: unknown = await response.json();
		if (!isObject(data)) return { message: fallback, captchaRequired: false };
		const message = typeof data.detail === "string" ? data.detail : typeof data.message === "string" ? data.message : fallback;
		return { message, captchaRequired: data.captchaRequired === true };
	} catch {
		return { message: fallback, captchaRequired: false };
	}
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
