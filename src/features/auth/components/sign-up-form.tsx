"use client";

import { useActionState } from "react";
import { signUpAction } from "@/features/auth/actions/auth.actions";

export default function SignUpForm() {
	const [state, action, pending] = useActionState(signUpAction, { error: "" });

	return (
		<form action={action} aria-busy={pending}>
			<p>
				<label htmlFor="firstName">First name: </label>
				<input
					id="firstName"
					name="firstName"
					autoComplete="given-name"
					required
					readOnly={pending}
				/>
			</p>
			<p>
				<label htmlFor="lastName">Last name: </label>
				<input
					id="lastName"
					name="lastName"
					autoComplete="family-name"
					required
					readOnly={pending}
				/>
			</p>
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
					autoComplete="new-password"
					minLength={8}
					aria-describedby="password-help"
					required
					readOnly={pending}
				/>
			</p>
			<p id="password-help">At least 8 characters.</p>
			{state.error && <p role="alert">{state.error}</p>}
			<button type="submit" disabled={pending}>
				{pending ? "Creating account…" : "Sign up"}
			</button>
		</form>
	);
}