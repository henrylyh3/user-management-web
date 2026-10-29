"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
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

export default function AccountDataActions() {
	const router = useRouter();
	const [exporting, setExporting] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState("");

	async function exportData() {
		setError("");
		setExporting(true);

		try {
			const response = await fetch("/api/account/export", { credentials: "include", cache: "no-store" });
			if (response.status === 401) {
				router.replace("/sign-in?session=expired");
				router.refresh();
				return;
			}

			if (!response.ok) throw new Error(readMessage(await response.json(), "Unable to export account data."));
			const url = URL.createObjectURL(await response.blob());
			const link = document.createElement("a");
			link.href = url;
			link.download = "personal-data.json";
			link.click();
			URL.revokeObjectURL(url);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unable to export account data.");
		} finally {
			setExporting(false);
		}
	}

	async function deleteAccount(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		const form = event.currentTarget;
		const formData = new FormData(form);
		const confirmation = String(formData.get("confirmation") ?? "");
		const currentPassword = String(formData.get("currentPassword") ?? "");

		if (confirmation !== "DELETE") {
			setError("Type DELETE exactly to confirm account deletion.");
			return;
		}

		setDeleting(true);

		try {
			const csrfToken = await getCsrfToken();
			const response = await fetch("/api/account/delete", { method: "DELETE", headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken }, credentials: "include", body: JSON.stringify({ currentPassword }) });

			if (response.status === 401) {
				router.replace("/sign-in?session=expired");
				router.refresh();
				return;
			}

			if (!response.ok) throw new Error(readMessage(await response.json(), "Unable to delete the account."));
			form.reset();
			router.replace("/sign-in?status=account-deleted");
			router.refresh();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unable to delete the account.");
		} finally {
			setDeleting(false);
		}
	}

	return (
		<>
			<section className="mb-4" data-coral-panel="personal-data">
				<div>
					<h2 className="h4">Personal data</h2>
					<p className="text-secondary">Download your profile and active-session information as JSON. Password and token hashes are excluded.</p>
					<button className="btn btn-outline-primary" type="button" disabled={exporting || deleting} onClick={() => void exportData()}>{exporting ? "Preparing…" : "Download my data"}</button>
				</div>
			</section>

			<section data-coral-panel="danger">
				<div>
					<h2 className="h4 text-danger">Delete account</h2>
					<p className="text-secondary">This permanently deletes your profile, profile image, account tokens, and active sessions.</p>
					<form onSubmit={deleteAccount} aria-busy={deleting}>
						<div className="mb-3"><label className="form-label" htmlFor="deleteCurrentPassword">Current password</label><input className="form-control" id="deleteCurrentPassword" name="currentPassword" type="password" autoComplete="current-password" maxLength={128} required readOnly={deleting} /></div>
						<div className="mb-3"><label className="form-label" htmlFor="deleteConfirmation">Type DELETE to confirm</label><input className="form-control" id="deleteConfirmation" name="confirmation" type="text" autoComplete="off" pattern="DELETE" required readOnly={deleting} /></div>
						{error && <p className="alert alert-danger" role="alert">{error}</p>}
						<button className="btn btn-danger" type="submit" disabled={deleting || exporting}>{deleting ? "Deleting…" : "Delete my account"}</button>
					</form>
				</div>
			</section>
		</>
	);
}
