import { Button } from "@mizen-labs/ui";
import { typeRoles } from "@mizen-labs/ui/typography.styles";
import { props } from "@stylexjs/stylex";
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { componentDocs } from "../docs-registry";
import { landingStyles as s } from "../landing.styles";
import { LandingPreview } from "../landing-preview";

export const metadata = {
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
						render={
							<Link params={{ guide: "installation" }} to="/docs/$guide" />
						}
						size="lg"
						variant="brand"
					>
						Get started <IconArrowRight aria-hidden="true" size={18} />
					</Button>
					<Button
						nativeButton={false}
						render={
							<Link params={{ slug: "button" }} to="/docs/components/$slug" />
						}
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
					<Link
						params={{ guide: "foundations" }}
						to="/docs/$guide"
						{...props(typeRoles.ui, s.textLink)}
					>
						Foundations
					</Link>
					<Link
						params={{ guide: "cli" }}
						to="/docs/$guide"
						{...props(typeRoles.ui, s.textLink)}
					>
						CLI
					</Link>
					<Link
						params={{ guide: "for-agents" }}
						to="/docs/$guide"
						{...props(typeRoles.ui, s.textLink)}
					>
						For agents
					</Link>
				</nav>
			</footer>
		</main>
	);
}
