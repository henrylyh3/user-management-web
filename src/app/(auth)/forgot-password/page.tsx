import CoralPage from "@/components/coral-page";
import Link from "next/link";
import ForgotPasswordForm from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
	return (
		<CoralPage title="Forgot password" description="Enter your email and we will send a single-use reset link." navigation={<Link className="btn btn-outline-secondary" href="/sign-in">Back to sign in</Link>}>
			<ForgotPasswordForm />
		</CoralPage>
	);
}
