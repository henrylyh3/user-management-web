"use client";

import { useActionState, useCallback, useState } from "react";
import { forgotPasswordAction } from "@/features/auth/actions/auth.actions";
import { useEmailCooldown } from "@/features/auth/hooks/use-email-cooldown";
import TurnstileWidget from "@/features/auth/components/turnstile-widget";

export default function ForgotPasswordForm() {
	const [state, action, pending] = useActionState(forgotPasswordAction, { error: "", success: "" });
	const cooldownSeconds = useEmailCooldown(state.success, pending);
	const [captchaToken, setCaptchaToken] = useState("");
	const [captchaReset, setCaptchaReset] = useState(0);
	const handleCaptchaToken = useCallback((token: string) => setCaptchaToken(token), []);

	function handleSubmit() {
		window.setTimeout(() => {
			setCaptchaToken("");
			setCaptchaReset((value) => value + 1);
		}, 0);
	}

	return (
		<form action={action} aria-busy={pending} onSubmit={handleSubmit}>
			<div className="mb-3">
				<label className="form-label" htmlFor="email">Email</label>
				<input className="form-control" id="email" name="email" type="email" autoComplete="email" maxLength={254} required readOnly={pending} />
			</div>
			<input name="captchaToken" type="hidden" value={captchaToken} />
			<TurnstileWidget action="forgot_password" onToken={handleCaptchaToken} resetSignal={captchaReset} />
			{state.error && <p className="alert alert-danger" role="alert">{state.error}</p>}
			{state.success && <p className="alert alert-success" role="status">{state.success}</p>}
			<button className="btn btn-primary w-100" type="submit" disabled={pending || cooldownSeconds > 0 || !captchaToken}>{pending ? "Sending…" : cooldownSeconds > 0 ? `Send again in ${cooldownSeconds}s` : "Send reset link"}</button>
		</form>
	);
}
