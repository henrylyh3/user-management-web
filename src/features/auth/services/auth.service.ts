import "server-only";

import { getApiBaseUrl } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/error";
import type { CurrentUser, ResetPasswordRequest, SignUpRequest } from "@/features/auth/types/auth.types";

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

async function postAccount(path: string, payload: unknown, fallback: string): Promise<void> {
	const response = await fetch(`${getApiBaseUrl()}/api/account/${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
		cache: "no-store",
		signal: AbortSignal.timeout(10000),
	});

	if (!response.ok) {
		throw new AuthApiError(await getApiErrorMessage(response, fallback), response.status);
	}
}

export async function signUp(payload: SignUpRequest): Promise<void> {
	const response = await fetch(`${getApiBaseUrl()}/api/auth/signup`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
		cache: "no-store",
		signal: AbortSignal.timeout(10000),
	});

	if (!response.ok) {
		throw new AuthApiError(await getApiErrorMessage(response, "Unable to create the account. Please try again."), response.status);
	}
}

export async function requestPasswordReset(email: string, captchaToken: string): Promise<void> {
	await postAccount("forgot-password", { email, captchaToken }, "Unable to request a password reset. Please try again.");
}

export async function resetPassword(payload: ResetPasswordRequest): Promise<void> {
	await postAccount("reset-password", payload, "The password reset link is invalid or expired.");
}

export async function verifyEmail(token: string): Promise<void> {
	await postAccount("verify-email", { token }, "The email verification link is invalid or expired.");
}

export async function resendVerification(email: string): Promise<void> {
	await postAccount("resend-verification", { email }, "Unable to request another verification email. Please try again.");
}

export async function getCurrentUser(token: string): Promise<CurrentUser | null> {
	const response = await fetch(`${getApiBaseUrl()}/api/auth/whoami`, {
		headers: { Authorization: `Bearer ${token}` },
		cache: "no-store",
		signal: AbortSignal.timeout(10000),
	});

	if (!response.ok) {
		throw new AuthApiError(await getApiErrorMessage(response, "Unable to verify your session. Please try again."), response.status);
	}

	const data: unknown = await response.json();

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
