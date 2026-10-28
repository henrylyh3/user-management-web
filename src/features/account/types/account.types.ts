export type UserSession = {
	sessionId: string;
	createdOn: string;
	lastSeenOn: string;
	expiresAt: string;
	userAgent: string;
	ipAddress: string;
	isCurrent: boolean;
};
