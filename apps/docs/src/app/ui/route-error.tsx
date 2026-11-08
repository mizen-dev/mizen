import { Button } from "@mizen-labs/ui/button";
import { props } from "@stylexjs/stylex";
import {
	type ErrorComponentProps,
	Link,
	useRouter,
} from "@tanstack/react-router";
import { useCallback } from "react";
import { docsStyles } from "../../shared/ui/docs.styles";

function reloadPage() {
	window.location.reload();
}

export function RouteError({ reset }: ErrorComponentProps) {
	const router = useRouter();
	const retry = useCallback(async () => {
		await router.invalidate();
		reset();
	}, [router, reset]);
	return (
		<main id="docs-content" {...props(docsStyles.content)}>
			<div role="alert" {...props(docsStyles.header)}>
				<h1 {...props(docsStyles.title)}>Unable to load this page</h1>
				<p>Try again. If the problem continues, reload the page.</p>
				<div {...props(docsStyles.pageActions)}>
					<Button onClick={retry}>Try again</Button>
					<Button onClick={reloadPage}>Reload page</Button>
					<Link to="/docs">Browse documentation</Link>
				</div>
			</div>
		</main>
	);
}
