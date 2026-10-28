import CoralPage from "@/components/coral-page";
import Link from "next/link";
import ResendVerificationForm from "@/features/auth/components/resend-verification-form";

export default function ResendVerificationPage() {
	return (
		<CoralPage title="Verify your email" description="Request a new verification link for an unverified account." navigation={<Link className="btn btn-outline-secondary" href="/sign-in">Back to sign in</Link>}>
			<ResendVerificationForm />
		</CoralPage>
	);
}
