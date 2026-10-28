"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/features/auth/actions/auth.actions";

export default function ResetPasswordForm({ token }: { token: string }) {
	const action = resetPasswordAction.bind(null, token);
	const [state, formAction, pending] = useActionState(action, { error: "", success: "" });

	return (
		<form action={formAction} aria-busy={pending}>
			<div className="mb-3">
				<label className="form-label" htmlFor="newPassword">New password</label>
				<input className="form-control" id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required readOnly={pending} />
			</div>
			<div className="mb-3">
				<label className="form-label" htmlFor="confirmPassword">Confirm new password</label>
				<input className="form-control" id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required readOnly={pending} />
			</div>
			{state.error && <p className="alert alert-danger" role="alert">{state.error}</p>}
			<button className="btn btn-primary w-100" type="submit" disabled={pending}>{pending ? "Resetting…" : "Reset password"}</button>
		</form>
	);
}
