import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

import { RouteError } from "./ui/route-error";

export function getRouter() {
	return createRouter({
		defaultErrorComponent: RouteError,
		defaultPreload: "intent",
		routeTree,
	});
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
