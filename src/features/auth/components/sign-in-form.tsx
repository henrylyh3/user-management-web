"use client";

import { useCallback, useState, type FormEvent } from "react";
import TurnstileWidget from "@/features/auth/components/turnstile-widget";

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export default function SignInForm() {
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	const [failedAttempts, setFailedAttempts] = useState(0);
	const [captchaRequired, setCaptchaRequired] = useState(false);
	const [captchaToken, setCaptchaToken] = useState("");
	const [captchaReset, setCaptchaReset] = useState(0);
	const showCaptcha = captchaRequired || failedAttempts >= 2;
	const handleCaptchaToken = useCallback((token: string) => setCaptchaToken(token), []);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setPending(true);

		const formData = new FormData(event.currentTarget);
		const email = String(formData.get("email") ?? "").trim();
		const password = String(formData.get("password") ?? "");
		const keepMeSignedIn = formData.get("keepMeSignedIn") === "on";

		if (showCaptcha && !captchaToken) {
			setError("Complete the human verification before signing in.");
			setPending(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/signin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ email, password, keepMeSignedIn, captchaToken: captchaToken || null }),
			});
			const data: unknown = await response.json();

			if (!response.ok) {
				if (response.status === 401) setFailedAttempts((attempts) => attempts + 1);
				if (isObject(data) && data.captchaRequired === true) setCaptchaRequired(true);
				if (showCaptcha || (isObject(data) && data.captchaRequired === true)) {
					setCaptchaToken("");
					setCaptchaReset((value) => value + 1);
				}
				setError(isObject(data) && typeof data.message === "string" ? data.message : "Sign in failed.");
				return;
			}

			if (!isObject(data) || typeof data.redirectTo !== "string") {
				setError("Invalid sign-in response.");
				return;
			}

			window.location.assign(data.redirectTo);
		} catch {
			setError("Unable to reach the server. Please try again.");
		} finally {
			setPending(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} aria-busy={pending}>
			<div className="mb-3">
				<label className="form-label" htmlFor="email">Email</label>
				<input
					className="form-control"
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
					maxLength={254}
					readOnly={pending}
				/>
			</div>
			<div className="mb-3">
				<label className="form-label" htmlFor="password">Password</label>
				<input
					className="form-control"
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					required
					minLength={8}
					maxLength={128}
					readOnly={pending}
				/>
			</div>
			<div className="form-check mb-3">
				<input className="form-check-input" id="keepMeSignedIn" name="keepMeSignedIn" type="checkbox" disabled={pending} />
				<label className="form-check-label" htmlFor="keepMeSignedIn">Keep me signed in</label>
			</div>
			{showCaptcha && <TurnstileWidget action="signin" onToken={handleCaptchaToken} resetSignal={captchaReset} />}
			{error && <p className="alert alert-danger" role="alert">{error}</p>}
			<button className="btn btn-primary w-100" type="submit" disabled={pending || (showCaptcha && !captchaToken)}>
				{pending ? "Signing in…" : "Sign in"}
			</button>
		</form>
	);
}
