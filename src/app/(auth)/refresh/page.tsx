"use client";

import CoralPage from "@/components/coral-page";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function getSafeReturnTo(): string {
	const value = new URLSearchParams(window.location.search).get("returnTo") ?? "/";

	if (!value.startsWith("/") || value.startsWith("//")) return "/";

	const url = new URL(value, window.location.origin);
	if (url.origin !== window.location.origin || url.pathname === "/refresh") return "/";

	return `${url.pathname}${url.search}${url.hash}`;
}

function readCsrfToken(value: unknown): string | null {
	if (typeof value !== "object" || value === null || !("token" in value) || typeof value.token !== "string") return null;
	return value.token;
}

export default function RefreshPage() {
	const started = useRef(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (started.current) return;
		started.current = true;

		const returnTo = getSafeReturnTo();
		const attemptKey = `session-refresh:${returnTo}`;
		const previousAttempt = Number(window.sessionStorage.getItem(attemptKey) ?? 0);

		if (Date.now() - previousAttempt < 30000) {
			window.location.replace("/sign-in?session=expired");
			return;
		}

		window.sessionStorage.setItem(attemptKey, String(Date.now()));

		async function refreshSession() {
			try {
				const csrfResponse = await fetch("/api/auth/csrf", { credentials: "include", cache: "no-store" });
				const csrfData: unknown = await csrfResponse.json();
				const csrfToken = readCsrfToken(csrfData);

				if (!csrfResponse.ok || !csrfToken) throw new Error("csrf");

				const refreshResponse = await fetch("/api/auth/refresh", {
					method: "POST",
					headers: { "X-CSRF-Token": csrfToken },
					credentials: "include",
				});

				if (refreshResponse.ok) {
					window.location.replace(returnTo);
					return;
				}

				if (refreshResponse.status === 400 || refreshResponse.status === 401) {
					window.location.replace("/sign-in?session=expired");
					return;
				}

				window.sessionStorage.removeItem(attemptKey);
				setError(refreshResponse.status === 429 ? "Too many attempts. Please wait and reload." : "Unable to restore your session. Please try again.");
			} catch {
				window.sessionStorage.removeItem(attemptKey);
				setError("Unable to restore your session. Please try again.");
			}
		}

		void refreshSession();
	}, []);

	return (
		<CoralPage title={error || "Restoring your session…"} variant="status">
			<p className="visually-hidden" role="status">{error || "Restoring your session…"}</p>
			{error && <Link className="btn btn-outline-secondary" href="/sign-in">Go to sign in</Link>}
		</CoralPage>
	);
}
