import CoralPage from "@/components/coral-page";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuditEventList, { pageHref } from "@/features/audit-events/components/audit-event-list";
import { AuditEventApiError, getAuditEvents } from "@/features/audit-events/services/audit-event.service";
import type { AuditEventFilters, AuditOutcome } from "@/features/audit-events/types/audit-event.types";
import SignOutButtons from "@/features/auth/components/sign-out-buttons";
import { getSessionToken, getUserHomePath, redirectToSessionRefresh, requireSessionUser } from "@/lib/session";

type SearchParameters = Record<string, string | string[] | undefined>;

export default async function AuditEventsPage({ searchParams }: { searchParams: Promise<SearchParameters> }) {
	const parameters = await searchParams;
	const page = parsePage(first(parameters.page));
	const filters = parseFilters(parameters);
	const returnTo = pageHref(page, filters);
	const currentUser = await requireSessionUser(returnTo);

	if (!currentUser.isAdmin) redirect(getUserHomePath(currentUser));

	const token = await getSessionToken();
	if (!token) redirectToSessionRefresh(returnTo);

	let events;

	try {
		events = await getAuditEvents(token, { ...filters, page, pageSize: 20 });
	} catch (error) {
		if (error instanceof AuditEventApiError && error.status === 401) redirectToSessionRefresh(returnTo);
		if (error instanceof AuditEventApiError && error.status === 403) redirect("/sign-in?session=forbidden");
		throw error;
	}

	if (events.totalPages > 0 && page > events.totalPages) redirect(pageHref(events.totalPages, filters));

	return (
		<CoralPage title="Audit events" description="Security and account activity, newest first." variant="workspace" navigation={<Link className="btn btn-outline-secondary" href="/users">Back to users</Link>} actions={<SignOutButtons />}>
			<AuditEventList events={events} filters={filters} />
		</CoralPage>
	);
}

function parseFilters(parameters: SearchParameters): AuditEventFilters {
	const outcome = first(parameters.outcome);

	return {
		module: clean(first(parameters.module), 64),
		action: clean(first(parameters.action), 64),
		outcome: isOutcome(outcome) ? outcome : "",
		actorUserId: clean(first(parameters.actorUserId), 24),
		resourceType: clean(first(parameters.resourceType), 64),
		resourceId: clean(first(parameters.resourceId), 128),
		from: validDate(first(parameters.from)),
		to: validDate(first(parameters.to)),
	};
}

function first(value: string | string[] | undefined): string {
	return typeof value === "string" ? value : "";
}

function clean(value: string, maximumLength: number): string {
	return value.trim().slice(0, maximumLength);
}

function parsePage(value: string): number {
	const page = Number(value || "1");
	return Number.isSafeInteger(page) && page > 0 && page <= 1_000_000 ? page : 1;
}

function validDate(value: string): string {
	return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00.000Z`)) ? value : "";
}

function isOutcome(value: string): value is AuditOutcome {
	return value === "Success" || value === "Failure" || value === "Denied";
}
