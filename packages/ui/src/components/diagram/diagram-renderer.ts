import type { Mounted, MountOptions } from "pele/core";

const ZOOM_LABELS = {
	reset: "Fit diagram",
	zoomIn: "Zoom in",
	zoomOut: "Zoom out",
};

/**
 * Loads only the grammar the source uses, then mounts it. Every Mermaid type
 * Pele renders works; cancelled mounts never touch detached DOM.
 */
export async function mountDiagram(
	element: HTMLElement,
	source: string,
	options: MountOptions,
	signal: AbortSignal
): Promise<Mounted | undefined> {
	const { detectType, load, mount } = await import("pele/lazy");
	const supported = await load(detectType(source));
	if (signal.aborted) {
		return;
	}
	if (!supported) {
		throw new Error("This diagram type isn't supported.");
	}
	return mount(element, source, {
		...options,
		fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
		images: false,
		links: false,
		// Fits the container; large diagrams get pinch, Ctrl+scroll, and + or −.
		zoom: { labels: ZOOM_LABELS },
	});
}
