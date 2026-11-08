import { createFileRoute } from "@tanstack/react-router";
import HomePage from "../../pages/home/ui/page";
import SiteLayout from "../layouts/site-layout";

export const Route = createFileRoute("/")({
	component: Home,
	head: () => ({
		meta: [
			{ title: "Mizen UI" },
			{
				content:
					"React components for dashboards and data-rich interfaces. Explore interactive charts, metrics, and tables built with Base UI and StyleX.",
				name: "description",
			},
		],
	}),
});
function Home() {
	return (
		<SiteLayout>
			<HomePage />
		</SiteLayout>
	);
}
