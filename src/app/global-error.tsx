"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

import CoralPage from "@/components/coral-page";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<html lang="en">
			<body className="bg-body-tertiary text-body">
				<CoralPage title="The application could not load" description="Please retry. If the problem continues, come back later." variant="status">
					<button className="btn btn-primary" type="button" onClick={reset}>Retry</button>
				</CoralPage>
			</body>
		</html>
	);
}
