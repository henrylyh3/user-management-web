import { Suspense } from "react";
import Link from "next/link";
import SignInForm from "@/features/auth/components/sign-in-form";
import { redirectIfAuthenticated } from "@/lib/session";

async function SignInContent() {
	await redirectIfAuthenticated();

	return (
		<main className="container py-5">
			<div className="row justify-content-center">
				<div className="col-12 col-md-7 col-lg-5">
					<section className="card shadow-sm border-0">
						<div className="card-body p-4">
							<h1 className="h3 mb-4">Sign in</h1>
							<SignInForm />
							<nav className="d-flex justify-content-between mt-4" aria-label="Sign-in navigation">
								<Link className="btn btn-link px-0" href="/">Back</Link>
								<Link className="btn btn-link px-0" href="/sign-up">Create account</Link>
							</nav>
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}

export default function SignInPage() {
	return (
		<Suspense fallback={<p className="container py-5 text-secondary" role="status">Loading…</p>}>
			<SignInContent />
		</Suspense>
	);
}
