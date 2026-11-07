export function syncInputInvalid(
	element: HTMLInputElement | null,
	invalid: boolean
): void {
	if (!element) {
		return;
	}
	if (invalid) {
		element.setAttribute("aria-invalid", "true");
		return;
	}
	const hasFieldInvalid = element.closest("[data-invalid]") !== null;
	if (!hasFieldInvalid) {
		element.removeAttribute("aria-invalid");
	}
}
