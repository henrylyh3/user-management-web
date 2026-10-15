"use server";

import { redirect } from "next/navigation";
import { AuthApiError, getCurrentUser, signIn, signUp } from "@/features/auth/services/auth.service";
import type { AuthActionState } from "@/features/auth/types/auth.types";
import { getUserHomePath, setSession } from "@/lib/session";

function readField(formData: FormData, field: string): string {
	const value = formData.get(field);
	return typeof value === "string" ? value : "";
}

function authError(error: unknown): AuthActionState {
	if (error instanceof AuthApiError) {
		return { error: error.message };
	}

	return { error: "Authentication fail" };
}

export async function signInAction(
	_previousState: AuthActionState,
	formData: FormData,
): Promise<AuthActionState> {
	const email = readField(formData, "email").trim();
	const password = readField(formData, "password");

	if (!email || !password) {
		return { error: "Email and password are required." };
	}

	try {
		const result = await signIn({ email, password });
		const user = await getCurrentUser(result.token);

		if (user == null)
		{
			return { error: "Whoami issue" };
		}

		await setSession(result.token, result.expiresAt);
		redirect(getUserHomePath(user));
	} catch (error) {
		return authError(error);
	}

}

export async function signUpAction(
	_previousState: AuthActionState,
	formData: FormData,
): Promise<AuthActionState> {
	const firstName = readField(formData, "firstName").trim();
	const lastName = readField(formData, "lastName").trim();
	const email = readField(formData, "email").trim();
	const password = readField(formData, "password");

	if (!firstName || !lastName || !email || !password) {
		return { error: "All fields are required." };
	}

	if (password.length < 8) {
		return { error: "Password must contain at least 8 characters." };
	}

	try {
		const result = await signUp({ firstName, lastName, email, password });

		const user = await getCurrentUser(result.token);

		if (user == null)
		{
			return { error: "Whoami issue" };
		}

		await setSession(result.token, result.expiresAt);
			redirect(getUserHomePath(user));

	} catch (error) {

		return authError(error);
	}

}
