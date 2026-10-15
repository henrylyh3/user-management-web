import { Suspense } from "react";
import Link from "next/link";
import { redirectIfAuthenticated } from "@/lib/session";

async function Landing() {
	await redirectIfAuthenticated();

	return (
		<main>
			<h1>Landing</h1>
			<nav>
				<Link href="/sign-up">Sign up</Link>
				{" | "}
				<Link href="/sign-in">Sign in</Link>
			</nav>
		</main>
	);
}

export default function Home() {
	return (
		<Suspense fallback={<p role="status">Loading…</p>}>
			<Landing />
		</Suspense>
	);
}