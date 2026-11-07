import { props } from "@stylexjs/stylex";
import Link from "next/link";
import { shellStyles } from "./docs-shell.styles";
import { MizenLogo } from "./mizen-logo";
import { MobileNavigation } from "./mobile-navigation";
import { SiteLinks } from "./site-links";
import { ThemeToggle } from "./theme-toggle";
export function SiteHeader({ docs = false }: { docs?: boolean }) {
	return (
		<>
			<a {...props(shellStyles.skipLink)} href="#docs-content">
				Skip to content
			</a>
			<header {...props(shellStyles.header)}>
				<div {...props(shellStyles.headerInner)}>
					<Link
						aria-label="Mizen UI home"
						href="/"
						{...props(shellStyles.brand)}
					>
						<MizenLogo style={shellStyles.brandMark} />
						Mizen UI
					</Link>
					<div {...props(shellStyles.headerControls)}>
						<nav
							aria-label="Site navigation"
							{...props(shellStyles.headerLinks)}
						>
							<SiteLinks />
						</nav>
						<ThemeToggle />
						<MobileNavigation docs={docs} />
					</div>
				</div>
			</header>
		</>
	);
}
