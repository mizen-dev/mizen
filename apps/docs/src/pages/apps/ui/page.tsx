import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
	Grid,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { appDocs } from "../../../entities/documentation/model/apps";
import { docsStyles } from "../../../shared/ui/docs.styles";
import { appsStyles } from "./apps.styles";

export default function AppsPage() {
	return (
		<main id="docs-content" {...props(appsStyles.page)}>
			<header {...props(docsStyles.header, docsStyles.documentHeader)}>
				<h1 {...props(docsStyles.title)}>Apps</h1>
				<p {...props(docsStyles.lede)}>
					Whole screens built from Mizen components. Open one, read its sources,
					and copy them into your application.
				</p>
			</header>
			<Grid columns="auto" gap="4">
				{appDocs.map(({ description, slug, title }) => (
					<Card key={slug}>
						<CardHeader>
							<CardTitle>
								<Link params={{ app: slug }} to="/apps/$app">
									{title}
								</Link>
							</CardTitle>
							<CardDescription>{description}</CardDescription>
						</CardHeader>
					</Card>
				))}
			</Grid>
		</main>
	);
}
