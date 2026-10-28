import CoralPage from "@/components/coral-page";
import { Suspense } from "react";
import Link from "next/link";
import { redirectIfAuthenticated } from "@/lib/session";

async function Landing() {
	await redirectIfAuthenticated();

	return (
		<CoralPage title="User Management" description="Create an account or sign in to continue." variant="home">
			<nav data-coral-actions aria-label="Account options">
				<Link className="btn btn-primary" href="/sign-in">Sign in</Link>
				<Link className="btn btn-outline-primary" href="/sign-up">Sign up</Link>
			</nav>
		</CoralPage>
	);
}

export default function Home() {
	return (
		<Suspense fallback={<p className="container py-5 text-secondary" role="status">Loading…</p>}>
			<Landing />
		</Suspense>
	);
}
