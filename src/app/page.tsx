import { Suspense } from "react";
import Link from "next/link";
import { redirectIfAuthenticated } from "@/lib/session";

async function Landing() {
	await redirectIfAuthenticated();

	return (
		<main className="container py-5">
			<div className="row justify-content-center">
				<div className="col-12 col-md-8 col-lg-6">
					<section className="card shadow-sm border-0">
						<div className="card-body p-4 p-md-5 text-center">
							<h1 className="h2 mb-3">User Management</h1>
							<p className="text-secondary mb-4">Create an account or sign in to continue.</p>
							<nav className="d-grid gap-2" aria-label="Account options">
								<Link className="btn btn-primary" href="/sign-in">Sign in</Link>
								<Link className="btn btn-outline-primary" href="/sign-up">Sign up</Link>
							</nav>
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}

export default function Home() {
	return (
		<Suspense fallback={<p className="container py-5 text-secondary" role="status">Loading…</p>}>
			<Landing />
		</Suspense>
	);
}
