"use client";

import { useActionState } from "react";
import { signUpAction } from "@/features/auth/actions/auth.actions";

export default function SignUpForm() {
	const [state, action, pending] = useActionState(signUpAction, { error: "", success: "" });

	return (
		<form action={action} aria-busy={pending}>
			<div className="mb-3">
				<label className="form-label" htmlFor="firstName">First name</label>
				<input
					className="form-control"
					id="firstName"
					name="firstName"
					autoComplete="given-name"
					required
					maxLength={100}
					readOnly={pending}
				/>
			</div>
			<div className="mb-3">
				<label className="form-label" htmlFor="lastName">Last name</label>
				<input
					className="form-control"
					id="lastName"
					name="lastName"
					autoComplete="family-name"
					required
					maxLength={100}
					readOnly={pending}
				/>
			</div>
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
					autoComplete="new-password"
					minLength={8}
					maxLength={128}
					aria-describedby="password-help"
					required
					readOnly={pending}
				/>
				<div className="form-text" id="password-help">At least 8 characters.</div>
			</div>
			{state.error && <p className="alert alert-danger" role="alert">{state.error}</p>}
			<button className="btn btn-primary w-100" type="submit" disabled={pending}>
				{pending ? "Creating account…" : "Sign up"}
			</button>
		</form>
	);
}
