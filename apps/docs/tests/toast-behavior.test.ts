// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import {
	AnchoredToastProvider,
	anchoredToastManager,
	ToastProvider,
	toastManager,
} from "../../../packages/ui/src/components/toast/toast";

const h = createElement;
Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

const propsSpy = vi.fn((..._styles: unknown[]) => ({
	className: "toast-style",
	"data-stylex-applied": "true",
}));

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(styles: T): T => styles,
	defineConsts: <T extends object>(constants: T): T => constants,
	defineMarker: () => ({}),
	defineVars: <T extends object>(variables: T): T => variables,
	keyframes: <T extends object>(frames: T): T => frames,
	props: (...styles: unknown[]) => propsSpy(...styles),
	when: { ancestor: () => ":where(*)" },
}));

function mount(
	element: Parameters<ReturnType<typeof createRoot>["render"]>[0]
) {
	const container = document.body.appendChild(document.createElement("div"));
	const root = createRoot(container);
	act(() => root.render(element));
	const unmount = () => {
		act(() => root.unmount());
		container.remove();
	};
	return { container, unmount };
}

function resetToasts() {
	document.body.innerHTML = "";
	act(() => {
		toastManager.close();
		anchoredToastManager.close();
	});
}

const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`);

describe("Toast provider and manager behavior", () => {
	beforeEach(resetToasts);
	afterEach(resetToasts);

	it("renders stacked toast with portal slot, conditional action, and rootProps forwarding", () => {
		propsSpy.mockClear();
		const onAction = vi.fn();
		const { unmount } = mount(h(ToastProvider, null));

		let toastId = "";
		act(() => {
			toastId = toastManager.add({
				actionProps: { children: "Undo", onClick: onAction },
				data: { rootProps: { id: "custom-root-id" } },
				description: "File archived",
				title: "Archived",
				type: "success",
			});
		});

		expect(slot("toast-portal")).not.toBeNull();
		expect(slot("toast-viewport")).not.toBeNull();
		const rootEl = slot("toast-root") as HTMLElement | null;
		expect(rootEl?.id).toBe("custom-root-id");
		expect(rootEl?.getAttribute("data-slot")).toBe("toast-root");
		expect(slot("toast-icon")?.getAttribute("aria-hidden")).toBe("true");
		const title = slot("toast-title") as HTMLElement;
		const description = slot("toast-description") as HTMLElement;
		expect(title.textContent).toBe("Archived");
		expect(title.getAttribute("dir")).toBe("auto");
		expect(description.textContent).toBe("File archived");
		expect(description.getAttribute("dir")).toBe("auto");
		expect(slot("toast-action")?.textContent).toBe("Undo");

		act(() => {
			slot("toast-action")?.dispatchEvent(
				new MouseEvent("click", { bubbles: true })
			);
		});
		expect(onAction).toHaveBeenCalledTimes(1);

		act(() => {
			toastManager.close(toastId);
		});
		unmount();
	});

	it("omits action slot when actionProps is absent and supports all status icons", () => {
		const { unmount } = mount(h(ToastProvider, null));

		for (const type of ["error", "info", "loading", "warning"] as const) {
			let id = "";
			act(() => {
				id = toastManager.add({ title: `${type} toast`, type });
			});
			const icon = document.querySelector('[data-slot="toast-icon"]');
			expect(icon).not.toBeNull();
			expect(slot("toast-action")).toBeNull();
			act(() => {
				toastManager.close(id);
			});
		}

		let unknownId = "";
		act(() => {
			unknownId = toastManager.add({
				data: { rootProps: { id: "unknown-toast-root" } },
				title: "Unknown type",
				type: "custom-unknown",
			});
		});
		const el = document.querySelector("#unknown-toast-root");
		expect(el?.querySelector('[data-slot="toast-icon"]')).toBeNull();
		act(() => {
			toastManager.close(unknownId);
		});

		unmount();
	});

	it("replays update feedback distinguishing error shake from success pulse", () => {
		const { unmount } = mount(h(ToastProvider, null));
		act(() => {
			toastManager.add({ id: "job-sync", title: "Syncing...", type: "info" });
		});
		act(() => {
			toastManager.update("job-sync", { title: "Failed", type: "error" });
		});
		expect(slot("toast-root")?.getAttribute("data-update-animation")).toBe(
			"shake-odd"
		);
		act(() => {
			toastManager.update("job-sync", { title: "Recovered", type: "success" });
		});
		expect(slot("toast-root")?.getAttribute("data-update-animation")).toBe(
			"pulse-even"
		);
		act(() => {
			toastManager.close("job-sync");
		});
		unmount();
	});

	it("renders anchored toast with anchored slots, custom sideOffset, and update replay", () => {
		const anchorElement = document.createElement("button");
		document.body.appendChild(anchorElement);

		const { unmount } = mount(h(AnchoredToastProvider, null));

		let toastId = "";
		act(() => {
			toastId = anchoredToastManager.add({
				actionProps: { children: "View" },
				description: "Target details",
				positionerProps: { anchor: anchorElement, side: "top", sideOffset: 12 },
				title: "Target message",
				type: "info",
			});
		});

		expect(slot("toast-portal-anchored")).not.toBeNull();
		expect(slot("toast-viewport-anchored")).not.toBeNull();
		expect(slot("toast-positioner")).not.toBeNull();
		expect(slot("toast-popup")).not.toBeNull();
		expect(slot("toast-icon")).not.toBeNull();
		expect(slot("toast-title")?.getAttribute("dir")).toBe("auto");
		expect(slot("toast-description")?.getAttribute("dir")).toBe("auto");
		expect(slot("toast-action")?.textContent).toBe("View");

		act(() => {
			anchoredToastManager.update(toastId, {
				title: "Target error",
				type: "error",
			});
		});
		expect(slot("toast-popup")?.getAttribute("data-update-animation")).toBe(
			"shake-odd"
		);

		act(() => {
			anchoredToastManager.close(toastId);
		});
		unmount();
	});

	it("omits anchored toast when anchor is absent and keeps tooltip mode title-only", () => {
		const anchorElement = document.createElement("div");
		document.body.appendChild(anchorElement);

		const { unmount } = mount(h(AnchoredToastProvider, null));

		act(() => {
			anchoredToastManager.add({ title: "Orphaned toast" });
		});
		expect(slot("toast-positioner")).toBeNull();

		let tooltipId = "";
		act(() => {
			tooltipId = anchoredToastManager.add({
				actionProps: { children: "Ignored" },
				data: { tooltipStyle: true },
				description: "Ignored description",
				positionerProps: { anchor: anchorElement },
				title: "Copied",
				type: "success",
			});
		});

		expect(slot("toast-title")?.textContent).toBe("Copied");
		expect(slot("toast-title")?.getAttribute("dir")).toBe("auto");
		expect(slot("toast-icon")).toBeNull();
		expect(slot("toast-description")).toBeNull();
		expect(slot("toast-action")).toBeNull();

		act(() => {
			anchoredToastManager.update(tooltipId, { title: "Copied again" });
		});
		expect(slot("toast-popup")?.getAttribute("data-update-animation")).toBe(
			"pulse-odd"
		);
		unmount();
	});
	it.each([
		{ manager: toastManager, Provider: ToastProvider, rootSlot: "toast-root" },
		{
			manager: anchoredToastManager,
			Provider: AnchoredToastProvider,
			rootSlot: "toast-popup",
		},
	])(
		"forwards the root render target through $rootSlot",
		({ Provider, manager, rootSlot }) => {
			const anchor = document.body.appendChild(
				document.createElement("button")
			);
			const { unmount } = mount(h(Provider, null));
			act(() => {
				manager.add({
					data: { rootProps: { render: h("article") } },
					positionerProps: { anchor },
					title: "Native styling",
					type: "info",
				});
			});
			const rootEl = slot(rootSlot) as HTMLElement;
			expect(rootEl.tagName).toBe("ARTICLE");
			unmount();
			anchor.remove();
		}
	);
	it("keeps disabled toast actions inactive", () => {
		const onAction = vi.fn();
		const { unmount } = mount(h(ToastProvider, null));
		act(() =>
			toastManager.add({
				actionProps: {
					children: "Continue",
					disabled: true,
					onClick: onAction,
				},
				title: "Action unavailable",
			})
		);
		const action = slot("toast-action") as HTMLButtonElement;
		expect(action.disabled).toBe(true);
		act(() => action.click());
		expect(onAction).not.toHaveBeenCalled();
		unmount();
	});
});
