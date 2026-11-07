// biome-ignore lint/performance/noBarrelFile: Subpath entrypoint re-exports TanStack useForm and provides focus helper.
export { useForm } from "@tanstack/react-form";

function isElementDisabled(element: HTMLElement): boolean {
	if (element.hasAttribute("disabled")) {
		return true;
	}
	if ("disabled" in element && element.disabled === true) {
		return true;
	}
	if (element.getAttribute("aria-disabled") === "true") {
		return true;
	}
	if (element.closest("fieldset[disabled]") !== null) {
		return true;
	}
	return false;
}

export function focusFirstInvalidControl(
	form: HTMLFormElement | null | undefined
): boolean {
	if (!form) {
		return false;
	}

	const candidates = form.querySelectorAll<HTMLElement>(
		'[aria-invalid="true"]'
	);

	for (const candidate of candidates) {
		if (isElementDisabled(candidate)) {
			continue;
		}
		if (typeof candidate.focus === "function") {
			candidate.focus();
			if (candidate.ownerDocument.activeElement === candidate) {
				return true;
			}
		}
	}

	return false;
}
