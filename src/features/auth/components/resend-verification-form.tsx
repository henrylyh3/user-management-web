"use client";

import { useActionState } from "react";
import { resendVerificationAction } from "@/features/auth/actions/auth.actions";
import { useEmailCooldown } from "@/features/auth/hooks/use-email-cooldown";

export default function ResendVerificationForm() {
	const [state, action, pending] = useActionState(resendVerificationAction, { error: "", success: "" });
	const cooldownSeconds = useEmailCooldown(state.success, pending);

	return (
		<form action={action} aria-busy={pending}>
			<div className="mb-3">
				<label className="form-label" htmlFor="email">Email</label>
				<input className="form-control" id="email" name="email" type="email" autoComplete="email" maxLength={254} required readOnly={pending} />
			</div>
			{state.error && <p className="alert alert-danger" role="alert">{state.error}</p>}
			{state.success && <p className="alert alert-success" role="status">{state.success}</p>}
			<button className="btn btn-primary w-100" type="submit" disabled={pending || cooldownSeconds > 0}>{pending ? "Sending…" : cooldownSeconds > 0 ? `Send again in ${cooldownSeconds}s` : "Resend verification link"}</button>
		</form>
	);
}
