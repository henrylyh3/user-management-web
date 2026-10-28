export type User = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	imageUrl: string | null;
};

export type AdminUser = User & {
	role: "User" | "Admin";
	status: "Active" | "Disabled";
	lockoutEnd: string | null;
	isLockedOut: boolean;
	lastSignInOn: string | null;
	createdOn: string;
	modifiedOn: string;
	createdBy: string;
	modifiedBy: string;
};

export type PagedUsers = { items: AdminUser[]; page: number; pageSize: number; totalCount: number; totalPages: number; };

export type UpdateUserRequest = { firstName: string; lastName: string; };
export type UpdateUserState = { error: string; success: string; };
