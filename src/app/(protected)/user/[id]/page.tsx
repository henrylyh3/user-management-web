import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionToken, requireSessionUser } from "@/lib/session";
import { getUser } from "@/features/users/services/user.service";
import UserForm from "@/features/users/components/user-form";

type UserPageProps = { params: Promise<{ id: string }> };

async function UserContent({ params }: UserPageProps) {
	const currentUser = await requireSessionUser();
	const token = await getSessionToken();

	if (!token) redirect("/sign-in");

	const { id } = await params;
	const user = await getUser(id, token);

	return (
		<main>
			{currentUser.isAdmin && <Link href="/users">Back to users</Link>}
			
			<h1>User</h1>
			<UserForm key={user.id} user={user} />

		</main>
	);
}

export default function UserPage({ params }: UserPageProps) {
	return (
		<Suspense fallback={<p role="status">Loading…</p>}>
			<UserContent params={params} />
		</Suspense>
	);
}