import { props } from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "../../../features/theme-switcher/ui/theme-toggle";
import { shellStyles } from "../../../shared/styles/docs-shell.styles";
import { MizenLogo } from "../../../shared/ui/mizen-logo";
import { MobileNavigation } from "./mobile-navigation";
import { SiteLinks } from "./site-links";
export function SiteHeader({ docs = false }: { docs?: boolean }) {
	return (
		<>
			<a {...props(shellStyles.skipLink)} href="#docs-content">
				Skip to content
			</a>
			<header {...props(shellStyles.header)}>
				<div {...props(shellStyles.headerInner)}>
					<Link aria-label="Mizen UI home" to="/" {...props(shellStyles.brand)}>
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
