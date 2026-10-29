"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminUser } from "@/features/users/types/user.types";

type AdminUserControlsProps = { user: AdminUser; currentUserId: string };

export default function AdminUserControls({ user, currentUserId }: AdminUserControlsProps) {
	const router = useRouter();
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState("");
	const isCurrentUser = user.id === currentUserId;

	async function mutate(path: string, method: "PATCH" | "POST", body?: object) {
		setBusy(true);
		setMessage("");

		try {
			const csrfResponse = await fetch("/api/auth/csrf?authenticated=true", { credentials: "include", cache: "no-store" });
			const csrfData: unknown = await csrfResponse.json();
			const csrfToken = readCsrfToken(csrfData);

			if (!csrfResponse.ok || !csrfToken) throw new Error("Unable to verify the request.");

			const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/${path}`, {
				method,
				headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
				credentials: "include",
				body: body ? JSON.stringify(body) : undefined,
			});

			if (response.status === 401) {
				router.push(`/refresh?returnTo=${encodeURIComponent("/users")}`);
				return;
			}

			if (!response.ok) throw new Error(await readError(response));

			setMessage("Updated.");
			router.refresh();
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Unable to update the user.");
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="d-flex flex-column align-items-end gap-2">
			<div className="btn-group btn-group-sm" role="group" aria-label={`Administration controls for ${user.email}`}>
				<button className="btn btn-outline-primary" type="button" disabled={busy || isCurrentUser} onClick={() => mutate("role", "PATCH", { role: user.role === "Admin" ? "User" : "Admin" })}>
					{user.role === "Admin" ? "Make user" : "Make admin"}
				</button>
				<button className={`btn ${user.status === "Disabled" ? "btn-outline-success" : "btn-outline-danger"}`} type="button" disabled={busy || (isCurrentUser && user.status === "Active")} onClick={() => mutate("status", "PATCH", { status: user.status === "Disabled" ? "Active" : "Disabled" })}>
					{user.status === "Disabled" ? "Enable" : "Disable"}
				</button>
				{user.isLockedOut && <button className="btn btn-outline-secondary" type="button" disabled={busy} onClick={() => mutate("unlock", "POST")}>Unlock</button>}
			</div>
			{message && <small className={message === "Updated." ? "text-success" : "text-danger"} role="status">{message}</small>}
		</div>
	);
}

function readCsrfToken(value: unknown): string {
	return typeof value === "object" && value !== null && "token" in value && typeof value.token === "string" ? value.token : "";
}

async function readError(response: Response): Promise<string> {
	try {
		const data: unknown = await response.json();
		if (typeof data === "object" && data !== null && "detail" in data && typeof data.detail === "string") return data.detail;
		if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") return data.message;
	} catch {
		// Use the safe fallback below.
	}

	return "Unable to update the user.";
}
