import CoralPage from "@/components/coral-page";
import { Suspense } from "react";
import Link from "next/link";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { redirectIfAuthenticated } from "@/lib/session";

async function SignUpContent() {
	await redirectIfAuthenticated();

	return (
		<CoralPage title="Sign up" navigation={<><Link className="btn btn-outline-secondary" href="/">Back</Link><Link className="btn btn-outline-secondary" href="/sign-in">Already have an account?</Link></>}>
			<SignUpForm />
		</CoralPage>
	);
}

export default function SignUpPage() {
	return (
		<Suspense fallback={<p className="container py-5 text-secondary" role="status">Loading…</p>}>
			<SignUpContent />
		</Suspense>
	);
}
