import "server-only";

import { getApiBaseUrl } from "@/lib/api/client";
import type { User, UpdateUserRequest } from "@/features/users/types/user.types";

export class UserApiError extends Error {
	constructor(public readonly status: number) {
		super("Unable to load user.");
		this.name = "UserApiError";
	}
}

export async function getUser(id: string, token: string): Promise<User> {
	const response = await fetch(
		`${getApiBaseUrl()}/api/User/${encodeURIComponent(id)}`,
		{
			headers: { Authorization: `Bearer ${token}` }
		},
	);

	if (!response.ok) {
		throw new UserApiError(response.status);
	}

	const data: unknown = await response.json();

	if (
		typeof data !== "object" ||
		data === null ||
		!("id" in data) ||
		typeof data.id !== "string" ||
		!("firstName" in data) ||
		typeof data.firstName !== "string" ||
		!("lastName" in data) ||
		typeof data.lastName !== "string" ||
		!("email" in data) ||
		typeof data.email !== "string" ||
		!("imageUrl" in data) ||
		(data.imageUrl !== null && typeof data.imageUrl !== "string")
	) {
		throw new Error("Invalid user response.");
	}

	return {
		id: data.id,
		firstName: data.firstName,
		lastName: data.lastName,
		email: data.email,
		imageUrl: data.imageUrl,
	};
}

export async function updateUser(id: string, token: string, payload: UpdateUserRequest,): Promise<void> {
	const response = await fetch(
		`${getApiBaseUrl()}/api/User/${encodeURIComponent(id)}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(payload),
		},
	);

	if (!response.ok) {
		throw new UserApiError(response.status);
	}
}