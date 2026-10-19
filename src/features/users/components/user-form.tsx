"use client";

import { useActionState, useState } from "react";
import { deleteUserImageAction, updateUserAction, uploadUserImageAction } from "@/features/users/actions/user.actions";
import type { User, UpdateUserState } from "@/features/users/types/user.types";
import Dropzone from "@/features/users/components/Dropzone";

type EditFormProps = {
	user: User;
	onSaved: () => void;
	onCancel: () => void;
};

function ProfileImage({ user }: { user: User }) {
	if (!user.imageUrl) {
		return (
			<div
				className="profile-image-frame rounded border bg-light"
				role="img"
				aria-label="No profile picture"
			/>
		);
	}

	return (
		<>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				className="profile-image-frame rounded border"
				src={user.imageUrl}
				alt={`${user.firstName} ${user.lastName}`}
				width={160}
				height={160}
			/>
		</>
	);
}

function UserImageEditor({ user }: { user: User }) {
	const remove = deleteUserImageAction.bind(null, user.id);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

	async function upload(previousState: UpdateUserState, formData: FormData) {
		const image = selectedFiles[0];

		// Dropzone stores file in state, so add the selected file to the form submission.
		if (image) {
			formData.set("image", image);
		}

		return uploadUserImageAction(user.id, previousState, formData);
	}

	const [uploadState, uploadAction, uploadPending] = useActionState(upload, {
		error: "",
		success: "",
	});

	const [deleteState, deleteAction, deletePending] = useActionState(remove, {
		error: "",
		success: "",
	});

	const pending = uploadPending || deletePending;

	return (
		<section className="mb-4">
			<ProfileImage user={user} />

			<div className="mt-3">
				<label className="form-label">Profile picture</label>

				<Dropzone
					key={user.imageUrl ?? "empty"}
					onFilesSelected={setSelectedFiles}
					accept="image/jpeg,image/png"
					multiple={false}
				/>

				<div className="d-flex flex-wrap gap-2 mt-2">
					<form action={uploadAction}>
						<button
							className="btn btn-primary"
							type="submit"
							disabled={pending || selectedFiles.length === 0}
						>
							{uploadPending ? "Uploading…" : "Upload picture"}
						</button>
					</form>

					{user.imageUrl && (
						<form action={deleteAction}>
							<button
								className="btn btn-outline-danger"
								type="submit"
								disabled={pending}
							>
								{deletePending ? "Removing…" : "Remove picture"}
							</button>
						</form>
					)}
				</div>
			</div>

			{uploadState.error && (
				<p className="alert alert-danger mt-3" role="alert">
					{uploadState.error}
				</p>
			)}

			{uploadState.success && (
				<p className="alert alert-success mt-3" role="status">
					{uploadState.success}
				</p>
			)}

			{deleteState.error && (
				<p className="alert alert-danger mt-3" role="alert">
					{deleteState.error}
				</p>
			)}

			{deleteState.success && (
				<p className="alert alert-success mt-3" role="status">
					{deleteState.success}
				</p>
			)}
		</section>
	);
}

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
		<section>
			<UserImageEditor user={user} />

			<form action={action} aria-busy={pending}>
				<div className="mb-3">
					<label className="form-label" htmlFor="firstName">First name</label>
					<input
						className="form-control"
						id="firstName"
						name="firstName"
						defaultValue={user.firstName}
						autoComplete="given-name"
						required
						readOnly={pending}
					/>
				</div>

				<div className="mb-3">
					<label className="form-label" htmlFor="lastName">Last name</label>
					<input
						className="form-control"
						id="lastName"
						name="lastName"
						defaultValue={user.lastName}
						autoComplete="family-name"
						required
						readOnly={pending}
					/>
				</div>

				<p><strong>Email:</strong> {user.email}</p>

				{state.error && <p className="alert alert-danger" role="alert">{state.error}</p>}

				<button className="btn btn-primary" type="submit" disabled={pending}>
					{pending ? "Saving…" : "Save"}
				</button>
				{" "}
				<button className="btn btn-outline-secondary" type="button" onClick={onCancel} disabled={pending}>
					Cancel
				</button>
			</form>
		</section>
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
			<div className="mb-4">
				<ProfileImage user={user} />
			</div>
			<dl className="row mb-4">
				<dt className="col-sm-4">First name</dt>
				<dd className="col-sm-8">{user.firstName}</dd>
				<dt className="col-sm-4">Last name</dt>
				<dd className="col-sm-8">{user.lastName}</dd>
				<dt className="col-sm-4">Email</dt>
				<dd className="col-sm-8">{user.email}</dd>
			</dl>

			{message && <p className="alert alert-success" role="status">{message}</p>}

			<button
				className="btn btn-primary"
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
