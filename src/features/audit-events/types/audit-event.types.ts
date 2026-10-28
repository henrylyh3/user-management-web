export type AuditOutcome = "Success" | "Failure" | "Denied";

export type AuditEvent = {
	id: string;
	occurredOn: string;
	module: string;
	action: string;
	outcome: AuditOutcome;
	actorUserId: string | null;
	resourceType: string | null;
	resourceId: string | null;
	traceId: string | null;
};

export type AuditEventFilters = {
	module: string;
	action: string;
	outcome: AuditOutcome | "";
	actorUserId: string;
	resourceType: string;
	resourceId: string;
	from: string;
	to: string;
};

export type AuditEventQuery = AuditEventFilters & { page: number; pageSize: number; };
export type PagedAuditEvents = { items: AuditEvent[]; page: number; pageSize: number; totalCount: number; totalPages: number; };
