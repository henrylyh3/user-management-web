"use client";

import { useActionState } from "react";
import { signInAction } from "@/features/auth/actions/auth.actions";

export default function SignInForm() {
	const [state, action, pending] = useActionState(signInAction, { error: "" });

	return (
		<form action={action} aria-busy={pending}>
			<div className="mb-3">
				<label className="form-label" htmlFor="email">Email</label>
				<input
					className="form-control"
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
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
					readOnly={pending}
				/>
			</div>
			{state.error && <p className="alert alert-danger" role="alert">{state.error}</p>}
			<button className="btn btn-primary w-100" type="submit" disabled={pending}>
				{pending ? "Signing in…" : "Sign in"}
			</button>
		</form>
	);
}
