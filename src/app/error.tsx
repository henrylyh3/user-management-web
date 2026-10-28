"use client";

import CoralPage from "@/components/coral-page";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<CoralPage title="Something went wrong" description="The page could not be loaded. Please try again." variant="status">
			<button className="btn btn-primary" type="button" onClick={reset}>Try again</button>
		</CoralPage>
	);
}
