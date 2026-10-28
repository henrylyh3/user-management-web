import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

export const metadata: Metadata = {
	title: "User Management",
	description: "Account registration and sign in.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body><header className="site-header"><Link className="site-wordmark" href="/">User Management</Link></header>{children}</body>
		</html>
	);
}
