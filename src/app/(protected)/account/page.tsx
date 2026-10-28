import CoralPage from "@/components/coral-page";
import Link from "next/link";
import AccountDataActions from "@/features/account/components/account-data-actions";
import SessionManagement from "@/features/account/components/session-management";
import SignOutButtons from "@/features/auth/components/sign-out-buttons";
import { getUserHomePath, requireSessionUser } from "@/lib/session";

export default async function AccountPage() {
	const currentUser = await requireSessionUser("/account");

	return (
		<CoralPage title="Account security and data" variant="workspace" navigation={<Link className="btn btn-outline-secondary" href={getUserHomePath(currentUser)}>Back</Link>} actions={<SignOutButtons />}>
			<div data-coral-account>
				<SessionManagement />
				<AccountDataActions />
			</div>
		</CoralPage>
	);
}
