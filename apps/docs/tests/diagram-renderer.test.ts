// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mountDiagram } from "../../../packages/ui/src/components/diagram/diagram-renderer";

const mounted = vi.hoisted(() => ({
	destroy: vi.fn(),
	refresh: vi.fn(),
	update: vi.fn(),
}));
vi.mock("pele/lazy", async (importOriginal) => ({
	...(await importOriginal<typeof import("pele/lazy")>()),
	mount: vi.fn(() => mounted),
}));

import { mount } from "pele/lazy";

const examples = [
	"flowchart LR\n A --> B",
	"sequenceDiagram\n App->>Agent: Review",
	"erDiagram\n TEAM ||--o{ PROJECT : owns",
	"stateDiagram-v2\n [*] --> Pending",
	'pie\n "Organic" : 4',
	"gantt\n title Plan\n Task :a, 2026-01-01, 3d",
];
beforeEach(() => vi.clearAllMocks());
describe("Diagram renderer boundary", () => {
	it.each(examples)("loads its supported grammar: %s", async (source) => {
		const host = document.createElement("div");
		host.style.fontSize = "14px";
		document.body.append(host);
		const result = await mountDiagram(
			host,
			source,
			{ idPrefix: "diagram-test", images: true, links: true, zoom: true },
			new AbortController().signal
		);
		expect(result).toBe(mounted);
		expect(mount).toHaveBeenCalledWith(
			host,
			source,
			expect.objectContaining({
				fontSize: 14,
				idPrefix: "diagram-test",
				images: false,
				links: false,
				zoom: expect.objectContaining({
					labels: expect.objectContaining({ zoomIn: "Zoom in" }),
				}),
			})
		);
	});
	it("rejects source that names no diagram type Pele renders", async () => {
		await expect(
			mountDiagram(
				document.createElement("div"),
				"notADiagram\n A --> B",
				{},
				new AbortController().signal
			)
		).rejects.toThrow("isn't supported");
		expect(mount).not.toHaveBeenCalled();
	});
	it("never mounts after its owner unmounts during a grammar import", async () => {
		const controller = new AbortController();
		const pending = mountDiagram(
			document.createElement("div"),
			examples[0],
			{},
			controller.signal
		);
		controller.abort();
		await expect(pending).resolves.toBeUndefined();
		expect(mount).not.toHaveBeenCalled();
	});
});
