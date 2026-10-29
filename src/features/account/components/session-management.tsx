"use client";

import { formatDateTime } from "@/lib/date-time";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserSession } from "@/features/account/types/account.types";

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isSession(value: unknown): value is UserSession {
	return isObject(value) && typeof value.sessionId === "string" && typeof value.createdOn === "string" && typeof value.lastSeenOn === "string" && typeof value.expiresAt === "string" && typeof value.userAgent === "string" && typeof value.ipAddress === "string" && typeof value.isCurrent === "boolean";
}

function readMessage(value: unknown, fallback: string): string {
	return isObject(value) && typeof value.message === "string" ? value.message : fallback;
}

async function getCsrfToken(): Promise<string> {
	const response = await fetch("/api/auth/csrf?authenticated=true", { credentials: "include", cache: "no-store" });
	const data: unknown = await response.json();
	if (!response.ok || !isObject(data) || typeof data.token !== "string" || !data.token) throw new Error("Unable to verify the request.");
	return data.token;
}


export default function SessionManagement() {
	const router = useRouter();
	const [sessions, setSessions] = useState<UserSession[]>([]);
	const [loading, setLoading] = useState(true);
	const [revoking, setRevoking] = useState<string | null>(null);
	const [error, setError] = useState("");

	useEffect(() => {
		const controller = new AbortController();

		async function loadSessions() {
			try {
				const response = await fetch("/api/auth/sessions", { credentials: "include", cache: "no-store", signal: controller.signal });
				const data: unknown = await response.json();

				if (response.status === 401) {
					router.replace("/sign-in?session=expired");
					return;
				}

				if (!response.ok || !Array.isArray(data) || !data.every(isSession)) throw new Error(readMessage(data, "Unable to load active sessions."));
				setSessions(data);
			} catch (requestError) {
				if (requestError instanceof DOMException && requestError.name === "AbortError") return;
				setError(requestError instanceof Error ? requestError.message : "Unable to load active sessions.");
			} finally {
				setLoading(false);
			}
		}

		void loadSessions();
		return () => controller.abort();
	}, [router]);

	async function revokeSession(sessionId: string) {
		setError("");
		setRevoking(sessionId);

		try {
			const csrfToken = await getCsrfToken();
			const response = await fetch(`/api/auth/sessions/${encodeURIComponent(sessionId)}`, { method: "DELETE", headers: { "X-CSRF-Token": csrfToken }, credentials: "include" });
			const data: unknown = await response.json();

			if (response.status === 401) {
				router.replace("/sign-in?session=expired");
				router.refresh();
				return;
			}

			if (!response.ok) throw new Error(readMessage(data, "Unable to revoke the session."));

			if (isObject(data) && data.revokedCurrentSession === true) {
				router.replace("/sign-in");
				router.refresh();
				return;
			}

			setSessions((current) => current.filter((session) => session.sessionId !== sessionId));
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unable to revoke the session.");
		} finally {
			setRevoking(null);
		}
	}

	return (
		<section className="mb-4" data-coral-panel="sessions">
			<div>
				<h2 className="h4">Active sessions</h2>
				<p className="text-secondary">Review signed-in devices and revoke any session you no longer use.</p>
				{loading && <p role="status">Loading sessions…</p>}
				{error && <p className="alert alert-danger" role="alert">{error}</p>}
				{!loading && !error && sessions.length === 0 && <p className="text-secondary mb-0">No active sessions found.</p>}
				{sessions.length > 0 && (
					<div className="list-group list-group-flush">
						{sessions.map((session) => (
							<div className="list-group-item px-0 py-3" data-coral-session key={session.sessionId}>
								<div className="d-flex flex-column flex-md-row justify-content-between gap-3">
									<div>
										<div className="fw-semibold">{session.userAgent || "Unknown device"} {session.isCurrent && <span className="badge text-bg-success ms-2">Current</span>}</div>
										<div className="small text-secondary">IP: {session.ipAddress || "Unknown"}</div>
										<div className="small text-secondary">Last active: {formatDateTime(session.lastSeenOn)}</div>
										<div className="small text-secondary">Expires: {formatDateTime(session.expiresAt)}</div>
									</div>
									<button className="btn btn-outline-danger align-self-md-center" type="button" disabled={revoking !== null} onClick={() => void revokeSession(session.sessionId)}>{revoking === session.sessionId ? "Revoking…" : "Revoke"}</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
