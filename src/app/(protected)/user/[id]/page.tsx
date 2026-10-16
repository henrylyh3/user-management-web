import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionToken, requireSessionUser } from "@/lib/session";
import { getUser } from "@/features/users/services/user.service";
import UserForm from "@/features/users/components/user-form";
import { signOutAction } from "@/features/auth/actions/auth.actions";

type UserPageProps = { params: Promise<{ id: string }> };

async function UserContent({ params }: UserPageProps) {
	const currentUser = await requireSessionUser();
	const token = await getSessionToken();

	if (!token) redirect("/sign-in");

	const { id } = await params;
	const user = await getUser(id, token);

	return (
		<main className="container py-5">
			<div className="row justify-content-center">
				<div className="col-12 col-lg-8">
					<div className="d-flex justify-content-between align-items-center mb-4">
						<div>
							{currentUser.isAdmin && <Link className="btn btn-link px-0" href="/users">Back to users</Link>}
							<h1 className="h2 mb-0">User profile</h1>
						</div>
						<form action={signOutAction}>
							<button className="btn btn-outline-secondary" type="submit">Sign out</button>
						</form>
					</div>

					<section className="card shadow-sm border-0">
						<div className="card-body p-4">
							<UserForm key={user.id} user={user} />
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}

export default function UserPage({ params }: UserPageProps) {
	return (
		<Suspense fallback={<p className="container py-5 text-secondary" role="status">Loading…</p>}>
			<UserContent params={params} />
		</Suspense>
	);
}
