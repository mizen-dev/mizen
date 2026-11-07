"use client";

import { Link, Stack, Text } from "@mizen/ui";
import NextLink from "next/link";
import { MemoryRouter, Route, Link as RouterLink, Routes } from "react-router";

export function LinkNextJs() {
	return (
		<Link render={<NextLink href="/docs/components/button" />}>
			Open Button documentation
		</Link>
	);
}

export function LinkReactRouter() {
	return (
		<MemoryRouter initialEntries={["/"]}>
			<Routes>
				<Route
					element={
						<Stack gap="2">
							<Text>Workspace overview</Text>
							<Link render={<RouterLink to="/projects" />}>Open projects</Link>
						</Stack>
					}
					path="/"
				/>
				<Route
					element={
						<Stack gap="2">
							<Text>Projects opened with React Router.</Text>
							<Link render={<RouterLink to="/" />}>Back to workspace</Link>
						</Stack>
					}
					path="/projects"
				/>
			</Routes>
		</MemoryRouter>
	);
}

export function LinkExternal() {
	return (
		<Link href="https://example.com" rel="noreferrer" target="_blank">
			Open external website
		</Link>
	);
}

export function LinkLongText() {
	return (
		<Text>
			Read{" "}
			<Link href="https://example.com/workspace_permissions_production_europe_west_revision_1842">
				workspace_permissions_production_europe_west_revision_1842
			</Link>{" "}
			before changing access.
		</Text>
	);
}
