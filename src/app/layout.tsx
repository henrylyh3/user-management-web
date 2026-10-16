import type { Metadata } from "next";
import type { ReactNode } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

export const metadata: Metadata = {
	title: "User Management",
	description: "Account registration and sign in.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className="bg-body-tertiary text-body">{children}</body>
		</html>
	);
}
