import type { ComponentRenderFn } from "@base-ui/react";
import type { ReactElement } from "react";
import { cloneElement, isValidElement } from "react";

export function protectRenderSlot<Props extends object, State>(
	slot: string,
	render: ReactElement | ComponentRenderFn<Props, State> | undefined,
	extraProps?: Record<string, unknown>
): ReactElement | ComponentRenderFn<Props, State> | undefined {
	const slotProps = { "data-slot": slot, ...extraProps };
	if (typeof render === "function") {
		return (renderProps: Props, state: State) => {
			const element = render(renderProps, state);
			return isValidElement(element)
				? cloneElement(element, slotProps)
				: element;
		};
	}
	return render && isValidElement(render)
		? cloneElement(render, slotProps)
		: render;
}

// A copy of props without the given keys. Props are never mutated, so
// callbacks that captured them stay valid.
export function omitProps<T extends object>(
	source: T,
	keys: readonly string[]
): T {
	const copy = { ...source };
	for (const key of keys) {
		Reflect.deleteProperty(copy, key);
	}
	return copy;
}
