import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";

// Router's built-in restoration also restores nested demo scrollers.
export function useDocumentScroll() {
	const router = useRouter();
	return useCallback(
		(element: HTMLBodyElement | null) => {
			if (!element) {
				return;
			}
			const positions = new Map<string, { left: number; top: number }>();
			const manual = () => {
				history.scrollRestoration = "manual";
			};
			const automatic = () => {
				history.scrollRestoration = "auto";
			};
			manual();
			window.addEventListener("pagehide", automatic);
			window.addEventListener("pageshow", manual);
			const save = router.subscribe("onBeforeLoad", ({ fromLocation }) => {
				const key = fromLocation?.state.__TSR_key;
				if (!key) {
					return;
				}
				positions.delete(key);
				positions.set(key, { left: window.scrollX, top: window.scrollY });
				const oldest = positions.keys().next().value;
				if (positions.size > 100 && oldest) {
					positions.delete(oldest);
				}
			});
			const restore = router.subscribe("onRendered", ({ toLocation }) => {
				const position = positions.get(toLocation.state.__TSR_key ?? "");
				if (position) {
					window.scrollTo({ ...position, behavior: "instant" });
				}
			});
			return () => {
				save();
				restore();
				window.removeEventListener("pagehide", automatic);
				window.removeEventListener("pageshow", manual);
				automatic();
			};
		},
		[router]
	);
}
