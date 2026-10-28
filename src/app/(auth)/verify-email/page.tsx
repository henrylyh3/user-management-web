import CoralPage from "@/components/coral-page";
import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailForm from "@/features/auth/components/verify-email-form";

export const metadata: Metadata = { referrer: "no-referrer" };

type VerifyEmailPageProps = { searchParams: Promise<{ token?: string | string[] }> };

async function VerifyEmailContent({ searchParams }: VerifyEmailPageProps) {
	const value = (await searchParams).token;
	const token = typeof value === "string" && value.length <= 256 ? value : "";

	return (
		<CoralPage title="Email verification">
			{token ? <VerifyEmailForm token={token} /> : <p className="alert alert-danger" role="alert">This verification link is invalid.</p>}
		</CoralPage>
	);
}

export default function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
	return <Suspense fallback={<p className="container py-5 text-secondary" role="status">Verifying…</p>}><VerifyEmailContent searchParams={searchParams} /></Suspense>;
}
