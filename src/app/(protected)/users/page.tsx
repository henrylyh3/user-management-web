import { Suspense } from "react";
import { redirect } from "next/navigation";
import { signOutAction } from "@/features/auth/actions/auth.actions";
import UserList from "@/features/users/components/user-list";
import { getUsers } from "@/features/users/services/user.service";
import { getSessionToken, requireSessionUser,} from "@/lib/session";

async function UsersContent() {
	const currentUser = await requireSessionUser();

	//only the user/admin can view the profile
	if (!currentUser.isAdmin) {
		if (!currentUser.userId) redirect("/sign-in");

		redirect(`/user/${encodeURIComponent(currentUser.userId)}`);
	}

	const token = await getSessionToken();

	if (!token) redirect("/sign-in");

	const users = await getUsers(token);

	return (
		<main className="container py-5">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h1 className="h2 mb-0">Users</h1>
				<form action={signOutAction}>
					<button className="btn btn-outline-secondary" type="submit">Sign out</button>
				</form>
			</div>

			<section className="card shadow-sm border-0">
				<div className="card-body">
					<UserList users={users} />
				</div>
			</section>
		</main>
	);
}

export default function UsersPage() {
	return (
		<Suspense fallback={<p className="container py-5 text-secondary" role="status">Loading…</p>}>
			<UsersContent />
		</Suspense>
	);
}
