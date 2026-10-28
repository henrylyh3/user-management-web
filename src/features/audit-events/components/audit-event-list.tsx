import Link from "next/link";
import type { AuditEventFilters, AuditOutcome, PagedAuditEvents } from "@/features/audit-events/types/audit-event.types";

const outcomes: AuditOutcome[] = ["Success", "Failure", "Denied"];

export default function AuditEventList({ events, filters }: { events: PagedAuditEvents; filters: AuditEventFilters }) {
	return (
		<>
			<form action="/audit-events" className="mb-4" data-coral-panel="filters" method="get">
				<div>
					<div className="row g-3">
						<FilterInput label="Module" name="module" value={filters.module} maxLength={64} />
						<FilterInput label="Action" name="action" value={filters.action} maxLength={64} />
						<div className="col-12 col-md-4">
							<label className="form-label" htmlFor="outcome">Outcome</label>
							<select className="form-select" defaultValue={filters.outcome} id="outcome" name="outcome">
								<option value="">All outcomes</option>
								{outcomes.map((outcome) => <option key={outcome} value={outcome}>{outcome}</option>)}
							</select>
						</div>
						<FilterInput label="Actor user ID" name="actorUserId" value={filters.actorUserId} maxLength={24} pattern="[a-fA-F0-9]{24}" />
						<FilterInput label="Resource type" name="resourceType" value={filters.resourceType} maxLength={64} />
						<FilterInput label="Resource ID" name="resourceId" value={filters.resourceId} maxLength={128} />
						<FilterInput label="From" name="from" value={filters.from} type="date" />
						<FilterInput label="To" name="to" value={filters.to} type="date" />
					</div>
					<div className="d-flex flex-wrap gap-2 mt-3">
						<button className="btn btn-primary" type="submit">Apply filters</button>
						<Link className="btn btn-outline-secondary" href="/audit-events">Clear</Link>
					</div>
				</div>
			</form>

			<section data-coral-panel="audit-records">
				<div>
					{events.items.length === 0 ? <p className="text-secondary mb-0">No audit events match these filters.</p> : <AuditTable events={events} />}
					<AuditPagination events={events} filters={filters} />
				</div>
			</section>
		</>
	);
}

function FilterInput({ label, name, value, type = "text", maxLength, pattern }: { label: string; name: string; value: string; type?: string; maxLength?: number; pattern?: string }) {
	return (
		<div className="col-12 col-md-4">
			<label className="form-label" htmlFor={name}>{label}</label>
			<input className="form-control" defaultValue={value} id={name} maxLength={maxLength} name={name} pattern={pattern} type={type} />
		</div>
	);
}

function AuditTable({ events }: { events: PagedAuditEvents }) {
	return (
		<div className="table-responsive">
			<table role="table" className="table align-middle mb-0" data-coral-table="audit">
				<thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">Time</th><th role="columnheader" scope="col">Event</th><th role="columnheader" scope="col">Outcome</th><th role="columnheader" scope="col">Actor</th><th role="columnheader" scope="col">Resource</th><th role="columnheader" scope="col">Trace</th></tr></thead>
				<tbody role="rowgroup">
					{events.items.map((event) => (
						<tr role="row" key={event.id}>
							<td role="cell" data-label="Time"><time dateTime={event.occurredOn}>{formatDate(event.occurredOn)}</time></td>
							<td role="cell" data-label="Event"><strong>{event.action}</strong><div className="small text-secondary">{event.module}</div></td>
							<td role="cell" data-label="Outcome"><span className={`badge ${outcomeClass(event.outcome)}`}>{event.outcome}</span></td>
							<td role="cell" data-label="Actor"><code className="small text-break">{event.actorUserId ?? "System"}</code></td>
							<td role="cell" data-label="Resource">{event.resourceType || event.resourceId ? <><span>{event.resourceType ?? "Resource"}</span><div><code className="small text-break">{event.resourceId ?? "—"}</code></div></> : "—"}</td>
							<td role="cell" data-label="Trace"><code className="small text-break" title={event.traceId ?? undefined}>{event.traceId ? `${event.traceId.slice(0, 12)}…` : "—"}</code></td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function AuditPagination({ events, filters }: { events: PagedAuditEvents; filters: AuditEventFilters }) {
	if (events.totalPages === 0) return null;

	return (
		<nav className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mt-3" aria-label="Audit-event pagination">
			<span className="text-secondary">Page {events.page} of {events.totalPages}; {events.totalCount} events</span>
			<div className="btn-group">
				<Link className={`btn btn-outline-primary${events.page <= 1 ? " disabled" : ""}`} href={pageHref(Math.max(1, events.page - 1), filters)} aria-disabled={events.page <= 1}>Previous</Link>
				<Link className={`btn btn-outline-primary${events.page >= events.totalPages ? " disabled" : ""}`} href={pageHref(Math.min(events.totalPages, events.page + 1), filters)} aria-disabled={events.page >= events.totalPages}>Next</Link>
			</div>
		</nav>
	);
}

export function pageHref(page: number, filters: AuditEventFilters): string {
	const parameters = new URLSearchParams();

	if (page > 1) parameters.set("page", String(page));
	for (const [key, value] of Object.entries(filters)) if (value) parameters.set(key, value);

	return parameters.size ? `/audit-events?${parameters}` : "/audit-events";
}

function outcomeClass(outcome: AuditOutcome): string {
	if (outcome === "Success") return "text-bg-success";
	if (outcome === "Denied") return "text-bg-warning";
	return "text-bg-danger";
}

function formatDate(value: string): string {
	return new Intl.DateTimeFormat("en-MY", { dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Kuala_Lumpur" }).format(new Date(value));
}
