import CoralPage from "@/components/coral-page";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ResetPasswordForm from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { referrer: "no-referrer" };

type ResetPasswordPageProps = { searchParams: Promise<{ token?: string | string[] }> };

async function ResetPasswordContent({ searchParams }: ResetPasswordPageProps) {
	const value = (await searchParams).token;
	const token = typeof value === "string" && value.length <= 256 ? value : "";

	return (
		<CoralPage title="Reset password" navigation={<Link className="btn btn-outline-secondary" href="/forgot-password">Request a new link</Link>}>
			{token ? <ResetPasswordForm token={token} /> : <p className="alert alert-danger" role="alert">This password reset link is invalid.</p>}
		</CoralPage>
	);
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
	return <Suspense fallback={<p className="container py-5 text-secondary" role="status">Loading…</p>}><ResetPasswordContent searchParams={searchParams} /></Suspense>;
}
