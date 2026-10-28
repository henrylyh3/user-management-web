"use server";

import { redirect } from "next/navigation";
import { AuthApiError, requestPasswordReset, resendVerification, resetPassword, signUp, verifyEmail } from "@/features/auth/services/auth.service";
import type { AuthActionState } from "@/features/auth/types/auth.types";

function readField(formData: FormData, field: string): string {
	const value = formData.get(field);
	return typeof value === "string" ? value : "";
}

function authError(error: unknown): AuthActionState {
	if (error instanceof AuthApiError) {
		return { error: error.message, success: "" };
	}

	return { error: "Unable to complete the request. Please try again.", success: "" };
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
		return { error: "All fields are required.", success: "" };
	}

	if (password.length < 8) {
		return { error: "Password must contain 8 to 128 characters.", success: "" };
	}

	try {
		await signUp({ firstName, lastName, email, password });
	} catch (error) {
		return authError(error);
	}

	redirect("/sign-in?status=verify-email");
}

export async function forgotPasswordAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
	const email = readField(formData, "email").trim();
	const captchaToken = readField(formData, "captchaToken");

	if (!email || email.length > 254) return { error: "Enter a valid email address.", success: "" };
	if (!captchaToken || captchaToken.length > 2048) return { error: "Complete the human verification and try again.", success: "" };

	try {
		await requestPasswordReset(email, captchaToken);
		return { error: "", success: "If an account exists for that email, a reset link has been sent." };
	} catch (error) {
		return authError(error);
	}
}

export async function resendVerificationAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
	const email = readField(formData, "email").trim();

	if (!email || email.length > 254) return { error: "Enter a valid email address.", success: "" };

	try {
		await resendVerification(email);
		return { error: "", success: "If the account requires verification, a new link has been sent." };
	} catch (error) {
		return authError(error);
	}
}

export async function resetPasswordAction(token: string, _previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
	const newPassword = readField(formData, "newPassword");
	const confirmPassword = readField(formData, "confirmPassword");

	if (!token || token.length > 256) return { error: "The password reset link is invalid.", success: "" };
	if (newPassword.length < 8 || newPassword.length > 128) return { error: "Password must contain 8 to 128 characters.", success: "" };
	if (newPassword !== confirmPassword) return { error: "Passwords do not match.", success: "" };

	try {
		await resetPassword({ token, newPassword });
	} catch (error) {
		return authError(error);
	}

	redirect("/sign-in?status=password-reset");
}

export async function verifyEmailAction(token: string, _previousState: AuthActionState): Promise<AuthActionState> {
	void _previousState;
	if (!token || token.length > 256) return { error: "The email verification link is invalid.", success: "" };

	try {
		await verifyEmail(token);
		return { error: "", success: "Your email is verified. You can now sign in." };
	} catch (error) {
		return authError(error);
	}
}
