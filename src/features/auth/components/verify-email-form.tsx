"use client";

import Link from "next/link";
import { useActionState } from "react";
import { verifyEmailAction } from "@/features/auth/actions/auth.actions";

export default function VerifyEmailForm({ token }: { token: string }) {
	const action = verifyEmailAction.bind(null, token);
	const [state, formAction, pending] = useActionState(action, { error: "", success: "" });

	if (state.success) {
		return <><p className="alert alert-success" role="status">{state.success}</p><Link className="btn btn-primary" href="/sign-in">Sign in</Link></>;
	}

	return (
		<form action={formAction} aria-busy={pending}>
			{state.error && <p className="alert alert-danger" role="alert">{state.error}</p>}
			<button className="btn btn-primary" type="submit" disabled={pending}>{pending ? "Verifying…" : "Verify email"}</button>
			{state.error && <Link className="btn btn-link" href="/resend-verification">Request a new link</Link>}
		</form>
	);
}
