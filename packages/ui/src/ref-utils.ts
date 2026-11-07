import type { Ref } from "react";

export function assignRef<T>(
	ref: Ref<T> | undefined,
	value: T | null
): (() => void) | undefined {
	if (!ref) {
		return undefined;
	}
	if (typeof ref === "function") {
		const cleanup = ref(value);
		if (typeof cleanup === "function") {
			return cleanup;
		}
		return value
			? () => {
					ref(null);
				}
			: undefined;
	}
	ref.current = value;
	return value
		? () => {
				ref.current = null;
			}
		: undefined;
}
