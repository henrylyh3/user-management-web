import { Suspense } from "react";
import Link from "next/link";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { redirectIfAuthenticated } from "@/lib/session";

async function SignUpContent() {
	await redirectIfAuthenticated();

	return (
		<main className="container py-5">
			<div className="row justify-content-center">
				<div className="col-12 col-md-7 col-lg-5">
					<section className="card shadow-sm border-0">
						<div className="card-body p-4">
							<h1 className="h3 mb-4">Sign up</h1>
							<SignUpForm />
							<nav className="d-flex justify-content-between mt-4" aria-label="Sign-up navigation">
								<Link className="btn btn-link px-0" href="/">Back</Link>
								<Link className="btn btn-link px-0" href="/sign-in">Already have an account?</Link>
							</nav>
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}

export default function SignUpPage() {
	return (
		<Suspense fallback={<p className="container py-5 text-secondary" role="status">Loading…</p>}>
			<SignUpContent />
		</Suspense>
	);
}
