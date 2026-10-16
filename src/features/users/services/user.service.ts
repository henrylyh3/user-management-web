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
	const response = await fetch(`${getApiBaseUrl()}/api/User/${encodeURIComponent(id)}`,
		{
			headers: { Authorization: `Bearer ${token}` }
		},
	);

	if (!response.ok) {
		throw new UserApiError(response.status);
	}

	const data: unknown = await response.json();

	return parseUser(data);
}

export async function updateUser(id: string, token: string, payload: UpdateUserRequest,): Promise<void> {
	const response = await fetch(`${getApiBaseUrl()}/api/User/${encodeURIComponent(id)}`,
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


export async function getUsers(token: string): Promise<User[]> {
	const response = await fetch(`${getApiBaseUrl()}/api/User`, {
		headers: { Authorization: `Bearer ${token}` }
	});

	if (!response.ok) {
		throw new UserApiError(response.status);
	}

	const data: unknown = await response.json();

	if (!Array.isArray(data)) {
		throw new Error("Invalid users response.");
	}

	return data.map((item) => {
		return parseUser(item);
	});
}

export async function uploadUserImage(id: string, token: string, image: File): Promise<User> {
	const formData = new FormData();

	formData.set("image", image);

	const response = await fetch( `${getApiBaseUrl()}/api/User/${encodeURIComponent(id)}/profile-picture`,
		{
			method: "PUT",
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData
		},
	);

	if (!response.ok) {
		throw new UserApiError(response.status);
	}

	const data: unknown = await response.json();

	return parseUser(data);
}

export async function deleteUserImage(id: string, token: string): Promise<User> {
	const response = await fetch( `${getApiBaseUrl()}/api/User/${encodeURIComponent(id)}/profile-picture`,
		{
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
			}
		},
	);

	if (!response.ok) {
		throw new UserApiError(response.status);
	}

	const data: unknown = await response.json();

	return parseUser(data);
}

function getImageUrl(imageUrl: string | null): string | null {
	if (!imageUrl) return null;

	if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
		return imageUrl;
	}

	return `${getApiBaseUrl()}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

function parseUser(data: unknown): User {
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
		imageUrl: getImageUrl(data.imageUrl),
	};
}