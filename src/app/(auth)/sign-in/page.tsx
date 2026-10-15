import { Suspense } from "react";
import Link from "next/link";
import SignInForm from "@/features/auth/components/sign-in-form";
import { redirectIfAuthenticated } from "@/lib/session";

async function SignInContent() {
	await redirectIfAuthenticated();

	return (
		<main>
			<h1>Sign in</h1>
			<SignInForm />
			<nav>
				<Link href="/">Back</Link>
				{" | "}
				<Link href="/sign-up">Sign up</Link>
			</nav>
		</main>
	);
}

export default function SignInPage() {
	return (
		<Suspense fallback={<p role="status">Loading…</p>}>
			<SignInContent />
		</Suspense>
	);
}