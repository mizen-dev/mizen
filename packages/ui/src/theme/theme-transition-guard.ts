export const THEME_GUARD_STYLE_ID = "mizen-theme-transition-guard";

export const THEME_GUARD_CSS =
	":root, *, *::before, *::after { transition-property: opacity, transform, translate, scale, rotate !important; }";

let cleanupFrameId: number | null = null;
let currentGuardElement: HTMLStyleElement | null = null;

function cancelPendingCleanup(): void {
	if (cleanupFrameId !== null && typeof cancelAnimationFrame === "function") {
		cancelAnimationFrame(cleanupFrameId);
		cleanupFrameId = null;
	}
}

function removeGuardElement(): void {
	if (currentGuardElement !== null) {
		currentGuardElement.remove();
		currentGuardElement = null;
		return;
	}
	if (typeof document !== "undefined") {
		const existing = document.getElementById(THEME_GUARD_STYLE_ID);
		if (existing !== null) {
			existing.remove();
		}
	}
}

function getExistingNonce(): string | null {
	if (typeof document === "undefined") {
		return null;
	}
	const script = document.querySelector<HTMLScriptElement>("script[nonce]");
	if (script === null) {
		return null;
	}
	return script.nonce || script.getAttribute("nonce");
}

function forceStyleCalculation(): void {
	if (typeof document === "undefined" || !document.documentElement) {
		return;
	}
	const _forced = document.documentElement.offsetHeight;
}

export function applyThemeTransitionGuard(): void {
	if (typeof document === "undefined" || !document.head) {
		return;
	}

	cancelPendingCleanup();

	let style = currentGuardElement;
	if (style === null) {
		const existing = document.getElementById(THEME_GUARD_STYLE_ID);
		if (existing instanceof HTMLStyleElement) {
			style = existing;
		}
	}

	if (style === null) {
		style = document.createElement("style");
		style.id = THEME_GUARD_STYLE_ID;
		const nonce = getExistingNonce();
		if (nonce !== null && nonce.length > 0) {
			style.setAttribute("nonce", nonce);
		}
		style.textContent = THEME_GUARD_CSS;
		document.head.appendChild(style);
	}

	currentGuardElement = style;
	forceStyleCalculation();
}

export function finishThemeTransitionGuard(): void {
	forceStyleCalculation();

	cancelPendingCleanup();

	if (
		typeof window === "undefined" ||
		typeof requestAnimationFrame !== "function"
	) {
		removeGuardElement();
		return;
	}

	cleanupFrameId = requestAnimationFrame(() => {
		cleanupFrameId = requestAnimationFrame(() => {
			removeGuardElement();
			cleanupFrameId = null;
		});
	});
}

export function cleanThemeTransitionGuard(): void {
	cancelPendingCleanup();
	removeGuardElement();
}
