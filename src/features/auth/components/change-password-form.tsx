"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export default function ChangePasswordForm() {
	const router = useRouter();
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		const formData = new FormData(event.currentTarget);
		const currentPassword = String(formData.get("currentPassword") ?? "");
		const newPassword = String(formData.get("newPassword") ?? "");
		const confirmPassword = String(formData.get("confirmPassword") ?? "");

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setPending(true);

		try {
			const csrfResponse = await fetch("/api/auth/csrf?authenticated=true", { credentials: "include", cache: "no-store" });
			const csrfData: unknown = await csrfResponse.json();
			const csrfToken = isObject(csrfData) && typeof csrfData.token === "string" ? csrfData.token : "";

			if (!csrfResponse.ok || !csrfToken) throw new Error("csrf");

			const response = await fetch("/api/auth/change-password", {
				method: "POST",
				headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
				credentials: "include",
				body: JSON.stringify({ currentPassword, newPassword }),
			});

			if (!response.ok) {
				const data: unknown = await response.json();
				setError(isObject(data) && typeof data.message === "string" ? data.message : "Unable to change the password.");
				return;
			}

			router.replace("/sign-in?status=password-changed");
			router.refresh();
		} catch {
			setError("Unable to change the password. Please try again.");
		} finally {
			setPending(false);
		}
	}

	return (
		<section className="border-top pt-4 mt-4">
			<h2 className="h5">Change password</h2>
			<p className="text-secondary">Changing your password signs out every device.</p>
			<form onSubmit={handleSubmit} aria-busy={pending}>
				<div className="mb-3"><label className="form-label" htmlFor="currentPassword">Current password</label><input className="form-control" id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" maxLength={128} required readOnly={pending} /></div>
				<div className="mb-3"><label className="form-label" htmlFor="newPassword">New password</label><input className="form-control" id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required readOnly={pending} /></div>
				<div className="mb-3"><label className="form-label" htmlFor="confirmPassword">Confirm new password</label><input className="form-control" id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required readOnly={pending} /></div>
				{error && <p className="alert alert-danger" role="alert">{error}</p>}
				<button className="btn btn-outline-primary" type="submit" disabled={pending}>{pending ? "Changing…" : "Change password"}</button>
			</form>
		</section>
	);
}
