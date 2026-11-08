// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vite-plus/test";
import type {
	AnchoredToastProviderProps,
	anchoredToastManager,
	ToastPosition,
	ToastProviderProps,
	toastManager,
} from "../../../packages/ui/src/components/toast/toast";
import { toastStyles } from "../../../packages/ui/src/components/toast/toast.styles";
import { toastStackedStyles } from "../../../packages/ui/src/components/toast/toast-stacked.styles";
import {
	getPositionSwipeDirections,
	getUpdateAnimation,
	resolveSideOffset,
} from "../../../packages/ui/src/components/toast/toast-utils";

vi.mock("@stylexjs/stylex", () => ({
	create: (styles: unknown) => styles,
	defineConsts: (constants: unknown) => constants,
	defineMarker: () => ({}),
	defineVars: (vars: unknown) => vars,
	keyframes: (frames: unknown) => frames,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

type Exact<Actual, Expected> = [Actual] extends [Expected]
	? [Expected] extends [Actual]
		? true
		: false
	: false;

type ExpectedPosition =
	| "top-left"
	| "top-center"
	| "top-right"
	| "bottom-left"
	| "bottom-center"
	| "bottom-right";

type Accepts<Props, Key extends PropertyKey> = Key extends keyof Props
	? true
	: false;

type IsAny<T> = 0 extends 1 & T ? true : false;
type Extends<A, B> = [A] extends [B] ? true : false;

type ProviderPortalProps = NonNullable<ToastProviderProps["portalProps"]>;
type AnchoredPortalProps = NonNullable<
	AnchoredToastProviderProps["portalProps"]
>;
type ToastDataPayload = NonNullable<
	Parameters<typeof toastManager.add>[0]["data"]
>;
type AnchoredToastDataPayload = NonNullable<
	Parameters<typeof anchoredToastManager.add>[0]["data"]
>;

const typeChecks = [
	true satisfies Exact<ToastPosition, ExpectedPosition>,
	true satisfies Accepts<ToastProviderProps, "position">,
	true satisfies Accepts<ToastProviderProps, "portalProps">,
	true satisfies Accepts<ToastProviderProps, "timeout">,
	true satisfies Accepts<ToastProviderProps, "limit">,
	true satisfies Accepts<ToastProviderProps, "toastManager">,
	false satisfies Accepts<ToastProviderProps, "className">,
	false satisfies Accepts<ToastProviderProps, "style">,
	false satisfies Accepts<ProviderPortalProps, "className">,
	false satisfies Accepts<ProviderPortalProps, "style">,
	true satisfies Accepts<ProviderPortalProps, "container">,
	true satisfies Accepts<ProviderPortalProps, "children">,
	true satisfies Accepts<AnchoredToastProviderProps, "portalProps">,
	true satisfies Accepts<AnchoredToastProviderProps, "toastManager">,
	false satisfies Accepts<AnchoredToastProviderProps, "className">,
	false satisfies Accepts<AnchoredToastProviderProps, "style">,
	false satisfies Accepts<AnchoredPortalProps, "className">,
	false satisfies Accepts<AnchoredPortalProps, "style">,
	true satisfies Accepts<AnchoredPortalProps, "container">,
	true satisfies Accepts<AnchoredPortalProps, "children">,
	false satisfies IsAny<ToastDataPayload>,
	false satisfies IsAny<AnchoredToastDataPayload>,
	true satisfies Extends<{ customProp: string }, ToastDataPayload>,
	true satisfies Extends<{ customProp: string }, AnchoredToastDataPayload>,
	true satisfies Accepts<ToastDataPayload, "rootProps">,
	true satisfies Accepts<ToastDataPayload, "tooltipStyle">,
	true satisfies Exact<ToastDataPayload["tooltipStyle"], boolean | undefined>,
	false satisfies Extends<{ tooltipStyle: string }, ToastDataPayload>,
] as const;

const expectedTypeChecks = [
	true,
	true,
	true,
	true,
	true,
	true,
	false,
	false,
	false,
	false,
	true,
	true,
	true,
	true,
	false,
	false,
	false,
	false,
	true,
	true,
	false,
	false,
	true,
	true,
	true,
	true,
	true,
	false,
] as const;

describe("Toast component surface and contract", () => {
	it("exports runtime surface with no internal or styled parts", async () => {
		const ToastModule = await import(
			"../../../packages/ui/src/components/toast/toast"
		);
		const exportedKeys = Object.keys(ToastModule).sort();
		const expectedKeys = [
			"AnchoredToastProvider",
			"ToastPrimitive",
			"ToastProvider",
			"anchoredToastManager",
			"toastManager",
		].sort();

		expect(exportedKeys).toEqual(expectedKeys);
		expect(typeof ToastModule.ToastProvider).toBe("function");
		expect(typeof ToastModule.AnchoredToastProvider).toBe("function");
		expect(typeof ToastModule.toastManager.add).toBe("function");
		expect(typeof ToastModule.toastManager.close).toBe("function");
		expect(typeof ToastModule.toastManager.update).toBe("function");
		expect(typeof ToastModule.anchoredToastManager.add).toBe("function");
		expect(typeof ToastModule.anchoredToastManager.close).toBe("function");
		expect(typeof ToastModule.ToastPrimitive.createToastManager).toBe(
			"function"
		);

		expect("Toast" in ToastModule).toBe(false);
		expect("ToastData" in ToastModule).toBe(false);
		expect("ToastRoot" in ToastModule).toBe(false);
		expect("ToastTitle" in ToastModule).toBe(false);
		expect("ToastDescription" in ToastModule).toBe(false);
		expect("ToastAction" in ToastModule).toBe(false);
		expect("ToastClose" in ToastModule).toBe(false);
		expect("ToastViewport" in ToastModule).toBe(false);
	});

	it("satisfies strict type contracts without any escapes", () => {
		expect(typeChecks).toEqual(expectedTypeChecks);
	});

	it("maps position-aware swipe directions horizontally first", () => {
		expect(getPositionSwipeDirections("top-left")).toEqual(["left", "up"]);
		expect(getPositionSwipeDirections("top-center")).toEqual(["up"]);
		expect(getPositionSwipeDirections("top-right")).toEqual(["right", "up"]);
		expect(getPositionSwipeDirections("bottom-left")).toEqual(["left", "down"]);
		expect(getPositionSwipeDirections("bottom-center")).toEqual(["down"]);
		expect(getPositionSwipeDirections("bottom-right")).toEqual([
			"right",
			"down",
		]);
	});

	it("computes alternating update replay animation with error differentiation", () => {
		expect(getUpdateAnimation("error", 1)).toBe("shake-odd");
		expect(getUpdateAnimation("error", 2)).toBe("shake-even");
		expect(getUpdateAnimation("success", 1)).toBe("pulse-odd");
		expect(getUpdateAnimation("success", 2)).toBe("pulse-even");
		expect(getUpdateAnimation("default", 3)).toBe("pulse-odd");
		expect(getUpdateAnimation("info", 0)).toBeUndefined();
		expect(getUpdateAnimation("info", undefined)).toBeUndefined();
	});

	it("enforces owned responsive viewport width and full-width roots and content", () => {
		const vp = toastStyles.viewport as Record<string, unknown>;
		const root = toastStackedStyles.root as Record<string, unknown>;
		const content = toastStyles.content as Record<string, unknown>;
		const stackedContent = toastStackedStyles.content as Record<
			string,
			unknown
		>;
		const contentOpacity = stackedContent.opacity as Record<string, unknown>;
		const contentPointerEvents = stackedContent.pointerEvents as Record<
			string,
			unknown
		>;
		expect(vp.width).toBe("calc(100% - 2.5rem)");
		expect(vp.maxWidth).toBe("400px");
		expect(root.width).toBe("100%");
		expect(content.width).toBe("100%");
		expect(contentOpacity["[data-behind]:not([data-expanded])"]).toBe(0);
		expect(contentPointerEvents["[data-behind]:not([data-expanded])"]).toBe(
			"none"
		);
		expect(toastStyles.surface.backgroundColor).toBeDefined();
		expect(content.backgroundColor).toBeUndefined();
	});

	it("preserves numeric sideOffset including zero and defaults missing or undefined to 4", () => {
		expect(resolveSideOffset(0)).toBe(0);
		expect(resolveSideOffset(12)).toBe(12);
		expect(resolveSideOffset(undefined)).toBe(4);
		expect(resolveSideOffset()).toBe(4);
	});

	it("anchors stacked toast roots to the corresponding viewport edge", () => {
		const root = toastStackedStyles.root as Record<string, unknown>;
		const rootOpacity = root.opacity as Record<string, unknown>;
		const rootTop = toastStackedStyles.rootTop as Record<string, unknown>;
		const rootBottom = toastStackedStyles.rootBottom as Record<string, unknown>;
		expect(rootOpacity.default).toBe(1);
		expect(rootTop.top).toBe(0);
		expect(rootTop.bottom).toBe("auto");
		expect(rootBottom.bottom).toBe(0);
		expect(rootBottom.top).toBe("auto");
	});

	it("positions stacked viewports using physical left and right edges", () => {
		const bottomLeft = toastStyles.bottomLeft as Record<string, unknown>;
		const bottomRight = toastStyles.bottomRight as Record<string, unknown>;
		const bottomCenter = toastStyles.bottomCenter as Record<string, unknown>;
		const topLeft = toastStyles.topLeft as Record<string, unknown>;
		const topRight = toastStyles.topRight as Record<string, unknown>;
		const topCenter = toastStyles.topCenter as Record<string, unknown>;

		expect(bottomLeft.left).toBeDefined();
		expect(bottomLeft.insetInlineStart).toBeUndefined();
		expect(bottomRight.right).toBeDefined();
		expect(bottomRight.insetInlineEnd).toBeUndefined();
		expect(bottomCenter.left).toBe("50%");
		expect(bottomCenter.insetInlineStart).toBeUndefined();

		expect(topLeft.left).toBeDefined();
		expect(topLeft.insetInlineStart).toBeUndefined();
		expect(topRight.right).toBeDefined();
		expect(topRight.insetInlineEnd).toBeUndefined();
		expect(topCenter.left).toBe("50%");
		expect(topCenter.insetInlineStart).toBeUndefined();
	});
});
