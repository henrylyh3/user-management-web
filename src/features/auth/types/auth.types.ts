export type SignUpRequest = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
};

export type ResetPasswordRequest = { token: string; newPassword: string; };

export type SignInRequest = { email: string; password: string; keepMeSignedIn: boolean; captchaToken?: string | null; };

export type AuthResponse = { token: string; expiresAt: string; };

export type CurrentUser = {
	isAuthenticated: boolean;
	userId: string | null;
	email: string | null;
	role: string | null;
	isAdmin: boolean;
};

export type AuthActionState = { error: string; success: string; };
