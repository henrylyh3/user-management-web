import "server-only";

import { getApiBaseUrl } from "@/lib/api/client";
import type { AuthResponse, CurrentUser, SignInRequest, SignUpRequest } from "@/features/auth/types/auth.types";

export class AuthApiError extends Error {
	constructor(message: string, public readonly status: number) {
		super(message);
		this.name = "AuthApiError";
	}
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isNullableString(value: unknown): value is string | null {
	return value === null || typeof value === "string";
}

async function authenticate(
	endpoint: "signup" | "signin",
	payload: SignUpRequest | SignInRequest,
): Promise<AuthResponse> {
	const response = await fetch(`${getApiBaseUrl()}/api/auth/${endpoint}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
		cache: "no-store",
		signal: AbortSignal.timeout(10000),
	});

	if (!response.ok) {
		throw new AuthApiError("Authentication failed. Please try again.", response.status);
	}

	const data: unknown = await response.json();

	if (
		!isObject(data) ||
		typeof data.token !== "string" ||
		!data.token ||
		typeof data.expiresAt !== "string" ||
		!Number.isFinite(Date.parse(data.expiresAt))
	) {
		throw new Error("Invalid authentication response.");
	}

	return { token: data.token, expiresAt: data.expiresAt };
}

export function signUp(payload: SignUpRequest): Promise<AuthResponse> {
	return authenticate("signup", payload);
}

export function signIn(payload: SignInRequest): Promise<AuthResponse> {
	return authenticate("signin", payload);
}

export async function getCurrentUser(token: string): Promise<CurrentUser | null> {
	const response = await fetch(`${getApiBaseUrl()}/api/auth/whoami`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	console.log("resoponse:",response);

	if (!response.ok) {
		throw new AuthApiError("Unable to verify your session. Please try again.", response.status);
	}

	const data: unknown = await response.json();

	console.log("data:", data);
	console.log("whoami:", JSON.stringify(data));

	if (
		!isObject(data) ||
		typeof data.isAuthenticated !== "boolean" ||
		!isNullableString(data.userId) ||
		!isNullableString(data.email) ||
		!isNullableString(data.role) ||
		typeof data.isAdmin !== "boolean"
	) {
		throw new Error("Invalid current-user response.");
	}

	return {
		isAuthenticated: data.isAuthenticated,
		userId: data.userId,
		email: data.email,
		role: data.role,
		isAdmin: data.isAdmin,
	};
}