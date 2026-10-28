import type { ReactNode } from "react";
import "@/app/coral-pages.css";

type CoralPageProps = { title: string; description?: string; navigation?: ReactNode; actions?: ReactNode; children?: ReactNode; variant?: "form" | "workspace" | "status" | "home"; };

export default function CoralPage({ title, description, navigation, actions, children, variant = "form" }: CoralPageProps) {
	if (variant === "workspace") {
		return (
			<main data-coral-page="workspace">
				<header data-coral-toolbar>
					<div data-coral-heading>
						{navigation && <nav aria-label="Page navigation">{navigation}</nav>}
						<h1>{title}</h1>
						{description && <p>{description}</p>}
					</div>
					{actions && <div data-coral-actions>{actions}</div>}
				</header>
				<div data-coral-content>{children}</div>
			</main>
		);
	}

	return (
		<main data-coral-page={variant}>
			<section data-coral-sheet>
				<header data-coral-heading>
					<h1>{title}</h1>
					{description && <p>{description}</p>}
				</header>
				<div data-coral-form>{children}{actions && <div data-coral-actions>{actions}</div>}</div>
				{navigation && <nav data-coral-navigation aria-label="Page navigation">{navigation}</nav>}
			</section>
		</main>
	);
}
