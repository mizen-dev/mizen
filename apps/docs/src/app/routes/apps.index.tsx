import { createFileRoute } from "@tanstack/react-router";
import AppsPage from "../../pages/apps/ui/page";
import SiteLayout from "../layouts/site-layout";
import { canonical } from "../lib/canonical";

export const Route = createFileRoute("/apps/")({
	component: Apps,
	head: () => ({
		links: [canonical("/apps/")],
		meta: [
			{ title: "Apps · Mizen UI" },
			{
				content:
					"Whole screens built from Mizen components, with their sources.",
				name: "description",
			},
		],
	}),
});
function Apps() {
	return (
		<SiteLayout>
			<AppsPage />
		</SiteLayout>
	);
}
