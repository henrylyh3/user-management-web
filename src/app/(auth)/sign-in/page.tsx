import { Suspense } from "react";
import Link from "next/link";
import SignInForm from "@/features/auth/components/sign-in-form";
import "./sign-in.module.css";
import { redirectIfAuthenticated } from "@/lib/session";

type SignInPageProps = { searchParams: Promise<{ status?: string | string[] }> };

async function SignInContent({ searchParams }: SignInPageProps) {
	await redirectIfAuthenticated();
	const status = (await searchParams).status;
	const message = status === "verify-email" ? "Account created. Check your email for the verification link before signing in." : status === "password-reset" ? "Password reset. Sign in with your new password." : status === "password-changed" ? "Password changed. Sign in again on this device." : status === "account-deleted" ? "Your account was deleted." : "";

	return (
		<main data-sign-in="page">
			<section data-sign-in="sheet" aria-labelledby="sign-in-title">
				<header data-sign-in="heading">
					<h1 id="sign-in-title">Sign in</h1>
				</header>
				<div data-sign-in="formArea">
					{message && <p className="alert alert-success" role="status">{message}</p>}
					<SignInForm />
					<nav data-sign-in="recovery" aria-label="Account recovery">
						<Link href="/forgot-password">Forgot password?</Link>
						<Link href="/resend-verification">Resend verification email</Link>
					</nav>
				</div>
				<nav data-sign-in="navigation" aria-label="Sign-in navigation">
					<Link href="/">Back</Link>
					<Link href="/sign-up">Create account</Link>
				</nav>
			</section>
		</main>
	);
}

export default function SignInPage({ searchParams }: SignInPageProps) {
	return (
		<Suspense fallback={<p className="container py-5 text-secondary" role="status">Loading…</p>}>
			<SignInContent searchParams={searchParams} />
		</Suspense>
	);
}
