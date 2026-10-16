"use client";

import { useActionState, useState } from "react";
import { updateUserAction } from "@/features/users/actions/user.actions";
import type { User, UpdateUserState } from "@/features/users/types/user.types";

type EditFormProps = {
	user: User;
	onSaved: () => void;
	onCancel: () => void;
};

function EditForm({ user, onSaved, onCancel }: EditFormProps) {
	async function save(previousState: UpdateUserState, formData: FormData) {
		const result = await updateUserAction(user.id, previousState, formData);

		if (result.success) onSaved();

		return result;
	}

	const [state, action, pending] = useActionState(save, {
		error: "",
		success: "",
	});

	return (
		<form action={action} aria-busy={pending}>
			<p>
				<label htmlFor="firstName">First name: </label>
				<input
					id="firstName"
					name="firstName"
					defaultValue={user.firstName}
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
					defaultValue={user.lastName}
					autoComplete="family-name"
					required
					readOnly={pending}
				/>
			</p>
			<p>Email: {user.email}</p>

			{state.error && <p role="alert">{state.error}</p>}

			<button type="submit" disabled={pending}>
				{pending ? "Saving…" : "Save"}
			</button>
			{" "}
			<button type="button" onClick={onCancel} disabled={pending}>
				Cancel
			</button>
		</form>
	);
}

export default function UserForm({ user }: { user: User }) {
	const [editing, setEditing] = useState(false);
	const [message, setMessage] = useState("");

	if (editing) {
		return (
			<EditForm
				user={user}
				onSaved={() => {
					setMessage("Profile saved.");
					setEditing(false);
				}}
				onCancel={() => setEditing(false)}
			/>
		);
	}

	return (
		<section>
			<p>First name: {user.firstName}</p>
			<p>Last name: {user.lastName}</p>
			<p>Email: {user.email}</p>

			{message && <p role="status">{message}</p>}

			<button
				type="button"
				onClick={() => {
					setMessage("");
					setEditing(true);
				}}
			>
				Edit
			</button>
		</section>
	);
}