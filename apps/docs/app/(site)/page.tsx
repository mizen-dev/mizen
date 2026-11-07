import { Button } from "@mizen/ui";
import { typeRoles } from "@mizen/ui/typography.styles";
import { props } from "@stylexjs/stylex";
import { IconArrowRight } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { componentDocs } from "../docs-registry";
import { landingStyles as s } from "../landing.styles";
import { LandingPreview } from "../landing-preview";

export const metadata: Metadata = {
	description:
		"React components for dashboards and data-rich interfaces. Explore interactive charts, metrics, and tables built with Base UI and StyleX.",
	title: "Mizen UI",
};

export default function HomePage() {
	return (
		<main id="docs-content" {...props(s.page, s.container)}>
			<header {...props(s.hero)}>
				<p {...props(typeRoles.ui, s.muted)}>
					{componentDocs.length} components · Open source
				</p>
				<h1 {...props(s.title)}>
					React components.
					<br />
					<span {...props(s.accent)}>One design language.</span>
				</h1>
				<p {...props(s.lede)}>
					Forms, data, and agent interfaces, built with Base UI and StyleX.
				</p>
				<div {...props(s.actions)}>
					<Button
						nativeButton={false}
						render={<Link href="/docs/installation" />}
						size="lg"
						variant="brand"
					>
						Get started <IconArrowRight aria-hidden="true" size={18} />
					</Button>
					<Button
						nativeButton={false}
						render={<Link href="/docs/components/button" />}
						size="lg"
						variant="outline"
					>
						Explore components
					</Button>
				</div>
			</header>
			<LandingPreview />
			<p {...props(typeRoles.ui, s.previewNote)}>
				Real Mizen components. Fictional data. Change the year or explore a
				chart.
			</p>
			<footer {...props(s.footer)}>
				<p {...props(typeRoles.ui, s.muted)}>Mizen UI · MIT licensed</p>
				<nav aria-label="Home footer" {...props(s.footerLinks)}>
					<Link href="/docs/foundations" {...props(typeRoles.ui, s.textLink)}>
						Foundations
					</Link>
					<Link href="/docs/cli" {...props(typeRoles.ui, s.textLink)}>
						CLI
					</Link>
					<Link
						href="/docs/integrations#consumer-agents"
						{...props(typeRoles.ui, s.textLink)}
					>
						For agents
					</Link>
				</nav>
			</footer>
		</main>
	);
}
