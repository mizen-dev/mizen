import { type ComponentType, lazy } from "react";

// Share one import between the route loader and rendering, including hydration.
export function preloadableExample(
	load: () => Promise<{ default: ComponentType }>
) {
	let component: ComponentType | undefined;
	let promise: ReturnType<typeof load> | undefined;
	const preload = () => {
		promise ??= load().then((module) => {
			component = module.default;
			return module;
		});
		return promise;
	};
	const Lazy = lazy(preload);
	// biome-ignore lint/correctness/noComponentHookFactories: Generated registries call this factory once at module scope, so each component identity stays stable.
	function Example() {
		const Component = component ?? Lazy;
		return <Component />;
	}
	return Object.assign(Example, { preload });
}
