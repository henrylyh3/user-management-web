"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function readCsrfToken(value: unknown): string | null {
	if (typeof value !== "object" || value === null || !("token" in value) || typeof value.token !== "string") return null;
	return value.token;
}

export default function SignOutButtons() {
	const router = useRouter();
	const [pending, setPending] = useState<"current" | "all" | null>(null);
	const [error, setError] = useState("");

	async function signOut(allSessions: boolean) {
		setError("");
		setPending(allSessions ? "all" : "current");

		try {
			const csrfResponse = await fetch(allSessions ? "/api/auth/csrf?authenticated=true" : "/api/auth/csrf", { credentials: "include", cache: "no-store" });
			const csrfData: unknown = await csrfResponse.json();
			const csrfToken = readCsrfToken(csrfData);

			if (!csrfResponse.ok || !csrfToken) throw new Error("csrf");

			const response = await fetch(allSessions ? "/api/auth/signout-all" : "/api/auth/signout", {
				method: "POST",
				headers: { "X-CSRF-Token": csrfToken },
				credentials: "include",
			});

			if (!response.ok) {
				if (response.status === 401) {
					router.replace("/sign-in?session=expired");
					router.refresh();
					return;
				}

				setError(response.status === 429 ? "Too many attempts. Please wait and try again." : "Unable to sign out. Please try again.");
				return;
			}

			router.replace("/sign-in");
			router.refresh();
		} catch {
			setError("Unable to reach the server. Please try again.");
		} finally {
			setPending(null);
		}
	}

	return (
		<div>
			<div className="d-flex flex-wrap gap-2 justify-content-end">
				<button className="btn btn-outline-secondary" type="button" disabled={pending !== null} onClick={() => void signOut(false)}>
					{pending === "current" ? "Signing out…" : "Sign out"}
				</button>
				<button className="btn btn-outline-danger" type="button" disabled={pending !== null} onClick={() => void signOut(true)}>
					{pending === "all" ? "Signing out…" : "Sign out all devices"}
				</button>
			</div>
			{error && <p className="text-danger mt-2 mb-0" role="alert">{error}</p>}
		</div>
	);
}
