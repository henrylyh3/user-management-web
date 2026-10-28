import "server-only";

import { getApiBaseUrl } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/error";
import type { AdminUser, PagedUsers, User, UpdateUserRequest } from "@/features/users/types/user.types";

export class UserApiError extends Error {
	constructor(public readonly status: number, message: string) {
		super(message);
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
		throw new UserApiError(response.status, await getApiErrorMessage(response, "Unable to load user."));
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
		throw new UserApiError(response.status, await getApiErrorMessage(response, "Unable to update the user."));
	}
}


export async function getUsers(token: string, page: number, pageSize: number): Promise<PagedUsers> {
	const response = await fetch(`${getApiBaseUrl()}/api/User?page=${page}&pageSize=${pageSize}`, {
		headers: { Authorization: `Bearer ${token}` },
		cache: "no-store",
	});

	if (!response.ok) {
		throw new UserApiError(response.status, await getApiErrorMessage(response, "Unable to load users."));
	}

	const data: unknown = await response.json();

	if (typeof data !== "object" || data === null || !("items" in data) || !Array.isArray(data.items) || !("page" in data) || !Number.isInteger(data.page) || !("pageSize" in data) || !Number.isInteger(data.pageSize) || !("totalCount" in data) || !Number.isInteger(data.totalCount) || !("totalPages" in data) || !Number.isInteger(data.totalPages)) {
		throw new Error("Invalid users response.");
	}

	return { items: data.items.map(parseAdminUser), page: data.page as number, pageSize: data.pageSize as number, totalCount: data.totalCount as number, totalPages: data.totalPages as number };
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
		throw new UserApiError(response.status, await getApiErrorMessage(response, "Unable to upload the image."));
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
		throw new UserApiError(response.status, await getApiErrorMessage(response, "Unable to remove the image."));
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

function parseAdminUser(data: unknown): AdminUser {
	const user = parseUser(data);

	if (
		typeof data !== "object" ||
		data === null ||
		!("role" in data) ||
		(data.role !== "User" && data.role !== "Admin") ||
		!("status" in data) ||
		(data.status !== "Active" && data.status !== "Disabled") ||
		!("lockoutEnd" in data) ||
		(data.lockoutEnd !== null && (typeof data.lockoutEnd !== "string" || !Number.isFinite(Date.parse(data.lockoutEnd)))) ||
		!("isLockedOut" in data) ||
		typeof data.isLockedOut !== "boolean" ||
		!("lastSignInOn" in data) ||
		(data.lastSignInOn !== null && (typeof data.lastSignInOn !== "string" || !Number.isFinite(Date.parse(data.lastSignInOn)))) ||
		!("createdOn" in data) ||
		typeof data.createdOn !== "string" ||
		!Number.isFinite(Date.parse(data.createdOn)) ||
		!("modifiedOn" in data) ||
		typeof data.modifiedOn !== "string" ||
		!Number.isFinite(Date.parse(data.modifiedOn)) ||
		!("createdBy" in data) ||
		typeof data.createdBy !== "string" ||
		!("modifiedBy" in data) ||
		typeof data.modifiedBy !== "string"
	) {
		throw new Error("Invalid admin user response.");
	}

	return { ...user, role: data.role, status: data.status, lockoutEnd: data.lockoutEnd, isLockedOut: data.isLockedOut, lastSignInOn: data.lastSignInOn, createdOn: data.createdOn, modifiedOn: data.modifiedOn, createdBy: data.createdBy, modifiedBy: data.modifiedBy };
}
