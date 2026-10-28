import CoralPage from "@/components/coral-page";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import SignOutButtons from "@/features/auth/components/sign-out-buttons";
import UserList from "@/features/users/components/user-list";
import { getUsers, UserApiError } from "@/features/users/services/user.service";
import { getSessionToken, getUserHomePath, redirectToSessionRefresh, requireSessionUser } from "@/lib/session";

type UsersPageProps = { searchParams: Promise<{ page?: string | string[] }> };

async function UsersContent({ searchParams }: UsersPageProps) {
	const pageValue = (await searchParams).page;
	const parsedPage = typeof pageValue === "string" ? Number(pageValue) : 1;
	const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
	const returnTo = page === 1 ? "/users" : `/users?page=${page}`;
	const currentUser = await requireSessionUser(returnTo);

	//only the user/admin can view the profile
	if (!currentUser.isAdmin) {
		if (!currentUser.userId) redirect("/sign-in");

		redirect(`/user/${encodeURIComponent(currentUser.userId)}`);
	}

	const token = await getSessionToken();

	if (!token) redirectToSessionRefresh(returnTo);

	let users;

	try {
		users = await getUsers(token, page, 20);
	} catch (error) {
		if (error instanceof UserApiError && error.status === 401) redirectToSessionRefresh(returnTo);
		if (error instanceof UserApiError && error.status === 403) {
			if (currentUser.isAdmin) redirect("/sign-in?session=forbidden");
			redirect(getUserHomePath(currentUser));
		}
		throw error;
	}

	if (users.totalPages > 0 && page > users.totalPages) redirect(`/users?page=${users.totalPages}`);

	return (
		<CoralPage title="Users" variant="workspace" navigation={<><Link className="btn btn-outline-secondary" href="/account">Account security and data</Link><Link className="btn btn-outline-secondary" href="/audit-events">Audit events</Link></>} actions={<SignOutButtons />}>
			<section data-coral-panel><UserList users={users} currentUserId={currentUser.userId ?? ""} /></section>
		</CoralPage>
	);
}

export default function UsersPage({ searchParams }: UsersPageProps) {
	return (
		<Suspense fallback={<p className="container py-5 text-secondary" role="status">Loading…</p>}>
			<UsersContent searchParams={searchParams} />
		</Suspense>
	);
}
