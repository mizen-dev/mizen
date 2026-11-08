import { createFileRoute } from "@tanstack/react-router";
import SiteLayout from "../../app/(site)/layout";
import HomePage, { metadata } from "../../app/(site)/page";

export const Route = createFileRoute("/")({
	component: Home,
	head: () => ({
		meta: [
			{ title: metadata.title },
			{ content: metadata.description, name: "description" },
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
