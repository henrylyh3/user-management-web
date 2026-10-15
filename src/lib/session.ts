import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import type { CurrentUser } from "@/features/auth/types/auth.types";

const SESSION_COOKIE = "session";

export async function setSession(token: string, expiresAt: string) {
	const expires = new Date(expiresAt);

	if (!token || !Number.isFinite(expires.getTime()) || expires <= new Date()) {
		throw new Error("Invalid or expired session.");
	}

	const cookieStore = await cookies();

	cookieStore.set(SESSION_COOKIE, token, {
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

export async function clearSession() {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<CurrentUser | null> {
	const token = await getSessionToken();

	if (!token) return null;

	const user = await getCurrentUser(token);

	return user?.isAuthenticated ? user : null;
}

export async function requireSessionUser(): Promise<CurrentUser> {
	const user = await getSessionUser();

	if (!user) redirect("/sign-in");

	return user;
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