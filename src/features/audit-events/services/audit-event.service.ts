import "server-only";

import { getApiBaseUrl } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/error";
import type { AuditEvent, AuditEventQuery, AuditOutcome, PagedAuditEvents } from "@/features/audit-events/types/audit-event.types";

export class AuditEventApiError extends Error {
	constructor(public readonly status: number, message: string) {
		super(message);
		this.name = "AuditEventApiError";
	}
}

export async function getAuditEvents(token: string, query: AuditEventQuery): Promise<PagedAuditEvents> {
	const parameters = new URLSearchParams({ page: String(query.page), pageSize: String(query.pageSize) });

	if (query.module) parameters.set("module", query.module);
	if (query.action) parameters.set("action", query.action);
	if (query.outcome) parameters.set("outcome", query.outcome);
	if (query.actorUserId) parameters.set("actorUserId", query.actorUserId);
	if (query.resourceType) parameters.set("resourceType", query.resourceType);
	if (query.resourceId) parameters.set("resourceId", query.resourceId);
	if (query.from) parameters.set("from", `${query.from}T00:00:00.000Z`);
	if (query.to) parameters.set("to", `${query.to}T23:59:59.999Z`);

	const response = await fetch(`${getApiBaseUrl()}/api/audit-events?${parameters}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });

	if (!response.ok) throw new AuditEventApiError(response.status, await getApiErrorMessage(response, "Unable to load audit events."));

	return parsePagedAuditEvents(await response.json());
}

function parsePagedAuditEvents(data: unknown): PagedAuditEvents {
	if (!isRecord(data) || !Array.isArray(data.items) || !Number.isInteger(data.page) || !Number.isInteger(data.pageSize) || !Number.isInteger(data.totalCount) || !Number.isInteger(data.totalPages)) {
		throw new Error("Invalid audit-events response.");
	}

	return { items: data.items.map(parseAuditEvent), page: data.page as number, pageSize: data.pageSize as number, totalCount: data.totalCount as number, totalPages: data.totalPages as number };
}

function parseAuditEvent(data: unknown): AuditEvent {
	if (!isRecord(data) || !isString(data.id) || !isValidDate(data.occurredOn) || !isString(data.module) || !isString(data.action) || !isOutcome(data.outcome) || !isNullableString(data.actorUserId) || !isNullableString(data.resourceType) || !isNullableString(data.resourceId) || !isNullableString(data.traceId)) {
		throw new Error("Invalid audit event.");
	}

	return { id: data.id, occurredOn: data.occurredOn, module: data.module, action: data.action, outcome: data.outcome, actorUserId: data.actorUserId, resourceType: data.resourceType, resourceId: data.resourceId, traceId: data.traceId };
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
	return typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
	return value === null || typeof value === "string";
}

function isValidDate(value: unknown): value is string {
	return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isOutcome(value: unknown): value is AuditOutcome {
	return value === "Success" || value === "Failure" || value === "Denied";
}
