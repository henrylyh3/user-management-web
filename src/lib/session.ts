import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextResponse } from "next/server";
import { AuthApiError, getCurrentUser } from "@/features/auth/services/auth.service";
import type { CurrentUser } from "@/features/auth/types/auth.types";

const SESSION_COOKIE = "session";

export function setSessionCookie(response: NextResponse, token: string, expiresAt: string): void {
	const expires = new Date(expiresAt);

	if (!token || !Number.isFinite(expires.getTime()) || expires <= new Date()) {
		throw new Error("Invalid or expired session.");
	}

	response.cookies.set(SESSION_COOKIE, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		expires,
	});
}

export async function getSessionToken(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(SESSION_COOKIE)?.value;
}

export function clearSessionCookie(response: NextResponse): void {
	response.cookies.set(SESSION_COOKIE, "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		expires: new Date(0),
	});
}

export async function getSessionUser(): Promise<CurrentUser | null> {
	const token = await getSessionToken();

	if (!token) return null;

	try {
		const user = await getCurrentUser(token);

		return user?.isAuthenticated ? user : null;
	} catch (error) {
		if (error instanceof AuthApiError && error.status === 401) return null;

		throw error;
	}
}

export async function requireSessionUser(returnTo: string): Promise<CurrentUser> {
	const user = await getSessionUser();

	if (!user) redirectToSessionRefresh(returnTo);

	return user;
}

export function redirectToSessionRefresh(returnTo: string): never {
	const safeReturnTo = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
	redirect(`/refresh?returnTo=${encodeURIComponent(safeReturnTo)}`);
}

export async function redirectIfAuthenticated(): Promise<void> {
	const user = await getSessionUser();

	if (user) redirect(getUserHomePath(user));
}

export function getUserHomePath(user: CurrentUser): string {
	if (user.isAdmin) return "/users";

	if (!user.userId) {
		throw new Error("Authenticated user is missing an ID.");
	}

	return `/user/${encodeURIComponent(user.userId)}`;
}
