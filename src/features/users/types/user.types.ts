export type User = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	imageUrl: string | null;
};

export type UpdateUserRequest = { firstName: string; lastName: string; };
export type UpdateUserState = { error: string; success: string; };