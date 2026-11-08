// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import {
	type CopyStatus,
	type UseCopyToClipboardOptions,
	useCopyToClipboard,
} from "../../../packages/ui/src/use-copy-to-clipboard";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
function Probe({
	result,
	options,
}: {
	result: {
		copy?: Copy;
		status?: CopyStatus;
	};
	options: UseCopyToClipboardOptions | undefined;
}) {
	Object.assign(result, useCopyToClipboard(options));
	return null;
}
type Copy = (value: string | Promise<string>) => Promise<boolean>;
function mount(options?: UseCopyToClipboardOptions) {
	const result: {
		copy?: Copy;
		status?: CopyStatus;
	} = {};
	const root = createRoot(document.createElement("div"));
	act(() => root.render(<Probe options={options} result={result} />));
	return {
		result,
		unmount: () => act(() => root.unmount()),
	};
}
function stubClipboard(writeText: (text: string) => Promise<void>) {
	Object.defineProperty(navigator, "clipboard", {
		configurable: true,
		value: {
			writeText,
		},
	});
}
afterEach(() => {
	vi.useRealTimers();
});
describe("useCopyToClipboard", () => {
	it("reports copied, then returns to idle after the timeout", async () => {
		vi.useFakeTimers();
		const writeText = vi.fn(() => Promise.resolve());
		stubClipboard(writeText);
		const onCopy = vi.fn();
		const { result, unmount } = mount({
			onCopy,
			timeout: 1000,
		});
		expect(result.status).toBe("idle");
		await act(async () => {
			expect(await result.copy?.("hello")).toBe(true);
		});
		expect(writeText).toHaveBeenCalledWith("hello");
		expect(onCopy).toHaveBeenCalledWith("hello");
		expect(result.status).toBe("copied");
		act(() => vi.advanceTimersByTime(1000));
		expect(result.status).toBe("idle");
		unmount();
	});
	it("reports failed until the next attempt when the browser refuses", async () => {
		vi.useFakeTimers();
		stubClipboard(() => Promise.reject(new Error("denied")));
		const { result, unmount } = mount();
		await act(async () => {
			expect(await result.copy?.("hello")).toBe(false);
		});
		expect(result.status).toBe("failed");
		act(() => vi.advanceTimersByTime(5000));
		expect(result.status).toBe("failed");
		unmount();
	});
	it("copies text that is still loading, and fails when it never arrives", async () => {
		const writeText = vi.fn(() => Promise.resolve());
		stubClipboard(writeText);
		const { result, unmount } = mount();
		await act(async () => {
			await result.copy?.(Promise.resolve("loaded"));
		});
		expect(writeText).toHaveBeenCalledWith("loaded");
		await act(async () => {
			await result.copy?.(Promise.reject(new Error("offline")));
		});
		expect(result.status).toBe("failed");
		unmount();
	});
	it("lets only the latest attempt report", async () => {
		stubClipboard(() => Promise.resolve());
		const { result, unmount } = mount();
		let finishSlow: (text: string) => void = () => undefined;
		const slow = new Promise<string>((resolve) => {
			finishSlow = resolve;
		});
		await act(async () => {
			const first = result.copy?.(slow);
			await result.copy?.(Promise.reject(new Error("offline")));
			finishSlow("late");
			await first;
		});
		// The late success of the first attempt does not hide the failure.
		expect(result.status).toBe("failed");
		unmount();
	});
});
