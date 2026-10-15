import { Suspense } from "react";
import Link from "next/link";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { redirectIfAuthenticated } from "@/lib/session";

async function SignUpContent() {
	await redirectIfAuthenticated();

	return (
		<main>
			<h1>Sign up</h1>
			<SignUpForm />
			<nav>
				<Link href="/">Back</Link>
				{" | "}
				<Link href="/sign-in">Sign in</Link>
			</nav>
		</main>
	);
}

export default function SignUpPage() {
	return (
		<Suspense fallback={<p role="status">Loading…</p>}>
			<SignUpContent />
		</Suspense>
	);
}