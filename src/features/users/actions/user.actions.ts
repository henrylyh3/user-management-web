"use server";

import { revalidatePath } from "next/cache";
import { getSessionToken } from "@/lib/session";
import { updateUser, UserApiError } from "@/features/users/services/user.service";
import type { UpdateUserState } from "@/features/users/types/user.types";

export async function updateUserAction(id: string, _previousState: UpdateUserState, formData: FormData): Promise<UpdateUserState> {
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
		let message = "Unable to save. Please try again.";

		return { error: message, success: "" };
	}

	revalidatePath(`/user/${encodeURIComponent(id)}`);
	revalidatePath("/users");

	return { error: "", success: "Profile saved." };
}