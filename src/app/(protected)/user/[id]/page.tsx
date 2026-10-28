import CoralPage from "@/components/coral-page";
import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionToken, getUserHomePath, redirectToSessionRefresh, requireSessionUser } from "@/lib/session";
import { getUser, UserApiError } from "@/features/users/services/user.service";
import UserForm from "@/features/users/components/user-form";
import SignOutButtons from "@/features/auth/components/sign-out-buttons";

type UserPageProps = { params: Promise<{ id: string }> };

async function UserContent({ params }: UserPageProps) {
	const { id } = await params;
	const returnTo = `/user/${encodeURIComponent(id)}`;
	const currentUser = await requireSessionUser(returnTo);
	const token = await getSessionToken();

	if (!token) redirectToSessionRefresh(returnTo);

	let user;

	try {
		user = await getUser(id, token);
	} catch (error) {
		if (error instanceof UserApiError && error.status === 401) redirectToSessionRefresh(returnTo);
		if (error instanceof UserApiError && error.status === 403) redirect(getUserHomePath(currentUser));
		if (error instanceof UserApiError && error.status === 404) notFound();
		throw error;
	}

	return (
		<CoralPage title="User profile" variant="workspace" navigation={<>{currentUser.isAdmin && <Link className="btn btn-outline-secondary" href="/users">Back to users</Link>}{currentUser.userId === user.id && <Link className="btn btn-outline-secondary" href="/account">Account security and data</Link>}</>} actions={<SignOutButtons />}>
			<section data-coral-panel><UserForm key={user.id} user={user} canChangePassword={currentUser.userId === user.id} /></section>
		</CoralPage>
	);
}

export default function UserPage({ params }: UserPageProps) {
	return (
		<Suspense fallback={<p className="container py-5 text-secondary" role="status">Loading…</p>}>
			<UserContent params={params} />
		</Suspense>
	);
}
