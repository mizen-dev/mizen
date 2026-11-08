import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import {
	HOOK_DROPZONE,
	HOOK_SPECIMEN,
	SLOT_INPUT,
	SLOT_ITEM_NAME,
	setupFileUploadBrowserSuite,
} from "./file-upload-browser-helper";

describe("FileUpload browser drag and drop contracts", {
	timeout: 20_000,
}, () => {
	const suite = setupFileUploadBrowserSuite();
	it("processes a browser-native file drop and renders its thumbnail", async () => {
		const page = suite.getPage();
		const preview = page.locator('[data-slot="component-preview"]').first();
		const dropzone = preview.locator('[data-slot="file-upload-dropzone"]');
		const directory = mkdtempSync(join(tmpdir(), "mizen-drop-"));
		const path = join(directory, "sample.png");
		writeFileSync(
			path,
			Buffer.from(
				"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
				"base64"
			)
		);
		const session = await page.context().newCDPSession(page);
		try {
			await dropzone.scrollIntoViewIfNeeded();
			const box = await dropzone.boundingBox();
			if (!box) {
				throw new Error("Missing dropzone");
			}
			const data = { dragOperationsMask: 1, files: [path], items: [] };
			for (const type of ["dragEnter", "dragOver", "drop"] as const) {
				// biome-ignore lint/performance/noAwaitInLoops: Drag events must arrive in order.
				await session.send("Input.dispatchDragEvent", {
					data,
					type,
					x: box.x + box.width / 2,
					y: box.y + box.height / 2,
				});
			}
			await expect
				.poll(() => preview.locator(SLOT_ITEM_NAME).textContent())
				.toBe("sample.png");
			await expect
				.poll(() =>
					preview.locator('[data-slot="file-upload-item-preview"] img').count()
				)
				.toBe(1);
			await preview.screenshot({
				path: "/private/tmp/mizen-upload-native-drop.png",
			});
		} finally {
			await session.detach();
			rmSync(directory, { recursive: true });
		}
	});
	it("accepts native drops in the primary preview and explains rejected files", async () => {
		const preview = suite
			.getPage()
			.locator('[data-slot="component-preview"]')
			.first();
		const dropzone = preview.locator('[data-slot="file-upload-dropzone"]');
		const handshake = await dropzone.evaluate((element) => {
			const transfer = new DataTransfer();
			transfer.items.add(new File(["image"], "photo.png"));
			const init = { bubbles: true, cancelable: true, dataTransfer: transfer };
			const enter = new DragEvent("dragenter", init);
			const over = new DragEvent("dragover", init);
			element.dispatchEvent(enter);
			element.dispatchEvent(over);
			element.dispatchEvent(new DragEvent("drop", init));
			return {
				enter: enter.defaultPrevented,
				over: over.defaultPrevented,
			};
		});
		expect(handshake).toEqual({ enter: true, over: true });
		await expect
			.poll(() => preview.locator(SLOT_ITEM_NAME).textContent())
			.toBe("photo.png");
		await preview.getByRole("button", { name: "Remove photo.png" }).click();
		await dropzone.evaluate((element) => {
			const transfer = new DataTransfer();
			transfer.items.add(
				new File(["text"], "notes.txt", { type: "text/plain" })
			);
			element.dispatchEvent(
				new DragEvent("drop", {
					bubbles: true,
					cancelable: true,
					dataTransfer: transfer,
				})
			);
		});
		await expect
			.poll(() => preview.textContent())
			.toContain("notes.txt isn't an image or PDF.");
	});

	it("shows a non-color drag cue and mirrors a dropped file to the native input", async () => {
		const page = suite.getPage();
		const dropzone = page.locator(HOOK_DROPZONE);

		await dropzone.evaluate((element) => {
			const transfer = new DataTransfer();
			transfer.items.add(
				new File(["drag preview"], "preview.pdf", {
					type: "application/pdf",
				})
			);
			element.dispatchEvent(
				new DragEvent("dragenter", {
					bubbles: true,
					cancelable: true,
					dataTransfer: transfer,
				})
			);
		});
		// The prompt names the count, and the marching edge shows.
		await expect.poll(() => dropzone.textContent()).toContain("Drop 1 file");
		await expect
			.poll(() =>
				dropzone.evaluate(
					(element) =>
						getComputedStyle(element.querySelector(":scope > svg") as Element)
							.opacity
				)
			)
			.toBe("1");

		await dropzone.evaluate((element) => {
			element.dispatchEvent(new DragEvent("dragleave", { bubbles: true }));
		});
		await expect
			.poll(() => dropzone.textContent())
			.toContain("Drop files here");

		await dropzone.evaluate((element) => {
			const file = new File(["dropped content"], "presentation.pdf", {
				type: "application/pdf",
			});
			const transfer = new DataTransfer();
			transfer.items.add(file);
			element.dispatchEvent(
				new DragEvent("dragenter", {
					bubbles: true,
					cancelable: true,
					dataTransfer: transfer,
				})
			);
			element.dispatchEvent(
				new DragEvent("drop", {
					bubbles: true,
					cancelable: true,
					dataTransfer: transfer,
				})
			);
		});

		await expect
			.poll(() => page.locator(SLOT_ITEM_NAME).textContent())
			.toBe("presentation.pdf");
		const mirroredFile = await page
			.locator(HOOK_SPECIMEN)
			.locator(SLOT_INPUT)
			.evaluate((element) => {
				if (
					element instanceof HTMLInputElement &&
					element.files &&
					element.files.length > 0
				) {
					return {
						count: element.files.length,
						name: element.files.item(0)?.name ?? null,
					};
				}
				return null;
			});
		expect(mirroredFile).toEqual({ count: 1, name: "presentation.pdf" });
	});
});
