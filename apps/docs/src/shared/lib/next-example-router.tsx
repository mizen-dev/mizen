import { useRouter, useRouterState } from "@tanstack/react-router";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import type { NextRouter } from "next/router";
import type { ReactNode } from "react";

// The docs execute real Next Link examples. Start owns their host navigation;
// the packed Next consumer still verifies integration with a real Next router.
export function NextExampleRouter({ children }: { children: ReactNode }) {
	const router = useRouter();
	const location = useRouterState({ select: (state) => state.location });
	const navigate: NextRouter["push"] = async (url, as) => {
		await router.navigate({ href: String(as ?? url) });
		return true;
	};
	const value: NextRouter = {
		asPath: location.href,
		back: () => router.history.back(),
		basePath: "",
		beforePopState: () => undefined,
		events: {
			emit: () => undefined,
			off: () => undefined,
			on: () => undefined,
		},
		forward: () => router.history.forward(),
		isFallback: false,
		isLocaleDomain: false,
		isPreview: false,
		isReady: true,
		pathname: location.pathname,
		prefetch: async () => undefined,
		push: navigate,
		query: {},
		reload: () => window.location.reload(),
		replace: async (url, as) => {
			await router.navigate({ href: String(as ?? url), replace: true });
			return true;
		},
		route: location.pathname,
	};
	return (
		<RouterContext.Provider value={value}>{children}</RouterContext.Provider>
	);
}
