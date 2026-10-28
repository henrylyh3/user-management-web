import CoralPage from "@/components/coral-page";
import Link from "next/link";

export default function NotFound() {
	return (
		<CoralPage title="Page not found" description="The page may have moved or no longer exists." variant="status">
			<p data-coral-code>404</p>
			<Link className="btn btn-primary" href="/">Go home</Link>
		</CoralPage>
	);
}
