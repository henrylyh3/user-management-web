"use client";

import { useActionState } from "react";
import { signInAction } from "@/features/auth/actions/auth.actions";

export default function SignInForm() {
	const [state, action, pending] = useActionState(signInAction, { error: "" });

	return (
		<form action={action} aria-busy={pending}>
			<p>
				<label htmlFor="email">Email: </label>
				<input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
					readOnly={pending}
				/>
			</p>
			<p>
				<label htmlFor="password">Password: </label>
				<input
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					required
					readOnly={pending}
				/>
			</p>
			{state.error && <p role="alert">{state.error}</p>}
			<button type="submit" disabled={pending}>
				{pending ? "Signing in…" : "Sign in"}
			</button>
		</form>
	);
}