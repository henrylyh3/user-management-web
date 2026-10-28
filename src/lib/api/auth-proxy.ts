import "server-only";

import type { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/error";
import type { AuthResponse } from "@/features/auth/types/auth.types";

const AUTH_COOKIE_NAMES = ["refresh_token", "__Host-user-management-antiforgery", "user-management-antiforgery"];

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export async function fetchAuthApi(path: string, init?: RequestInit): Promise<Response> {
	return fetch(`${getApiBaseUrl()}/api/auth/${path}`, {
		...init,
		cache: "no-store",
		signal: AbortSignal.timeout(10000),
	});
}

export async function fetchAccountApi(path: string, init?: RequestInit): Promise<Response> {
	return fetch(`${getApiBaseUrl()}/api/account/${path}`, {
		...init,
		cache: "no-store",
		signal: AbortSignal.timeout(10000),
	});
}

export async function fetchAdminUsersApi(path: string, init?: RequestInit): Promise<Response> {
	return fetch(`${getApiBaseUrl()}/api/admin/users/${path}`, {
		...init,
		cache: "no-store",
		signal: AbortSignal.timeout(10000),
	});
}

export function getAuthCookieHeader(request: NextRequest): string {
	return AUTH_COOKIE_NAMES.flatMap((name) => {
		const value = request.cookies.get(name)?.value;
		return value ? [`${name}=${value}`] : [];
	}).join("; ");
}

export function copySetCookieHeaders(source: Response, target: NextResponse): void {
	const headers = source.headers as Headers & { getSetCookie?: () => string[] };
	const cookies = headers.getSetCookie?.() ?? [];

	for (const cookie of cookies) {
		target.headers.append("set-cookie", cookie);
	}
}

export async function parseAuthResponse(response: Response): Promise<AuthResponse> {
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

export async function getErrorMessage(response: Response, fallback: string): Promise<string> {
	return getApiErrorMessage(response, fallback);
}
