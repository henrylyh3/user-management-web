"use server";

import { revalidatePath } from "next/cache";
import { getSessionToken } from "@/lib/session";
import {deleteUserImage, updateUser, uploadUserImage, UserApiError} from "@/features/users/services/user.service";
import type { UpdateUserState } from "@/features/users/types/user.types";

export async function updateUserAction(id: string, _previousState: UpdateUserState, formData: FormData): Promise<UpdateUserState> 
{
	const token = await getSessionToken();

	if (!token) {
		return { error: "Please sign in again.", success: "" };
	}

	const firstNameValue = formData.get("firstName");
	const lastNameValue = formData.get("lastName");

	const firstName = typeof firstNameValue === "string" ? firstNameValue.trim() : "";
	const lastName = typeof lastNameValue === "string" ? lastNameValue.trim() : "";

	try {
		await updateUser(id, token, {
			firstName: firstName.trim(),
			lastName: lastName.trim(),
		});
	} catch (error) {
		const message = "Unable to save. Please try again.";

		return { error: message, success: "" };
	}

	revalidatePath(`/user/${encodeURIComponent(id)}`);
	revalidatePath("/users");

	return { error: "", success: "Profile saved." };
}

export async function uploadUserImageAction(id: string, _previousState: UpdateUserState, formData: FormData): Promise<UpdateUserState> 
{
	const token = await getSessionToken();

	if (!token) {
		return { error: "Please sign in again.", success: "" };
	}

	const image = formData.get("image");

	if (!(image instanceof File) || image.size === 0) {
		return { error: "Select an image.", success: "" };
	}

	if (image.size > 2 * 1024 * 1024) {
		return { error: "Image must be 2 MB or smaller.", success: "" };
	}

	if (image.type !== "image/jpeg" && image.type !== "image/png") {
		return { error: "Only JPEG and PNG are allowed.", success: "" };
	}

	try {
		await uploadUserImage(id, token, image);
	} catch (error) {
		return { error: getErrorMessage(error), success: "" };
	}

	refreshUserPages(id);

	return { error: "", success: "Picture uploaded." };
}

export async function deleteUserImageAction(id: string, _previousState: UpdateUserState, _formData: FormData): Promise<UpdateUserState> 
{
	// required by useActionState but not required for delete, put void
	void _previousState;
	void _formData;
	const token = await getSessionToken();

	if (!token) {
		return { error: "Please sign in again.", success: "" };
	}

	try {
		await deleteUserImage(id, token);
	} catch (error) {
		return { error: getErrorMessage(error), success: "" };
	}

	refreshUserPages(id);

	return { error: "", success: "Picture removed." };
}

function refreshUserPages(id: string) {
	revalidatePath(`/user/${encodeURIComponent(id)}`);
	revalidatePath("/users");
}

function getErrorMessage(error: unknown): string {
	if (!(error instanceof UserApiError)) {
		return "Unable to complete request.";
	}

	if (error.status === 400) return "Request was rejected.";
	if (error.status === 401) return "Please sign in again.";
	if (error.status === 403) return "You are not allowed to update this user.";
	if (error.status === 404) return "User was not found.";
	if (error.status === 413) return "Image is too large.";

	return "Unable to complete request.";
}