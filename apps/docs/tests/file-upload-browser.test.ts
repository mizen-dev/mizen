import { describe, expect, it } from "vitest";
import {
	HOOK_DROPZONE,
	HOOK_LIST,
	HOOK_SPECIMEN,
	HOOK_TRIGGER,
	SLOT_INPUT,
	SLOT_ITEM,
	SLOT_ITEM_NAME,
	SLOT_TRIGGER,
	setupFileUploadBrowserSuite,
} from "./file-upload-browser-helper";

describe("FileUpload browser documentation route and interaction contracts", {
	timeout: 20_000,
}, () => {
	const suite = setupFileUploadBrowserSuite();
	it.each(["light", "dark"] as const)(
		"uploads multiple files without resetting retained cards in %s",
		async (theme) => {
			const page = suite.getPage();
			await page.emulateMedia({ colorScheme: theme });
			const preview = page.locator('[data-slot="component-preview"]').first();
			await preview.locator(SLOT_INPUT).setInputFiles(
				["Design brief.pdf", "Release notes.pdf", "Project assets.pdf"].map(
					(name) => ({
						buffer: Buffer.from("demo file"),
						mimeType: "application/pdf",
						name,
					})
				)
			);
			const items = preview.locator(SLOT_ITEM);
			expect(await items.count()).toBe(3);
			expect(
				await preview.locator('[data-slot="file-upload-dropzone"]').count()
			).toBe(1);
			expect(await preview.getByRole("progressbar").count()).toBe(3);
			await expect
				.poll(async () =>
					Number(
						await items
							.nth(1)
							.getByRole("progressbar")
							.getAttribute("aria-valuenow")
					)
				)
				.toBeGreaterThan(0);
			await preview.screenshot({
				path: `/private/tmp/mizen-upload-multiple-${theme}.png`,
			});
			const retained = await items.nth(1).elementHandle();
			if (!retained) {
				throw new Error("Missing retained upload item");
			}
			const before = Number(
				await items
					.nth(1)
					.getByRole("progressbar")
					.getAttribute("aria-valuenow")
			);
			await items
				.first()
				.getByRole("button", { name: "Remove Design brief.pdf" })
				.click();
			expect(await retained.evaluate((element) => element.isConnected)).toBe(
				true
			);
			expect(
				Number(
					await items
						.first()
						.getByRole("progressbar")
						.getAttribute("aria-valuenow")
				)
			).toBeGreaterThanOrEqual(before);
			await expect.poll(() => items.count()).toBe(2);
		}
	);
	it.each(["light", "dark"] as const)(
		"preserves the file through error, retry, and completion in %s",
		async (theme) => {
			const page = suite.getPage();
			await page.emulateMedia({ colorScheme: theme });
			const example = page.locator("#FileUploadRetryExample");
			await example.locator(SLOT_INPUT).setInputFiles({
				buffer: Buffer.from("demo"),
				mimeType: "application/pdf",
				name: "release.pdf",
			});
			const status = example.locator('[data-slot="file-upload-item-status"]');
			await expect
				.poll(() => status.getAttribute("data-status"), { timeout: 4000 })
				.toBe("error");
			expect(
				await example.getByRole("progressbar").getAttribute("aria-valuenow")
			).toBe("40");
			await expect
				.poll(() =>
					status.evaluate((element) => {
						// A failed row takes a soft red fill. A canvas pixel turns any
						// color format into RGB.
						const item = element.closest('[data-slot="file-upload-item"]');
						const context = document.createElement("canvas").getContext("2d");
						if (!(item && context)) {
							return false;
						}
						context.fillStyle = getComputedStyle(item).backgroundColor;
						context.fillRect(0, 0, 1, 1);
						const [r = 0, g = 0] = context.getImageData(0, 0, 1, 1).data;
						return r > g + 3;
					})
				)
				.toBe(true);
			await example.screenshot({
				path: `/private/tmp/mizen-upload-error-${theme}.png`,
			});
			await example.getByRole("button", { name: "Retry upload" }).click();
			expect(
				await example
					.getByRole("button", { name: "Remove release.pdf" })
					.evaluate((element) => element === document.activeElement)
			).toBe(true);
			await expect
				.poll(() => status.getAttribute("data-status"))
				.toBe("uploading");
			await expect
				.poll(() => status.getAttribute("data-status"), { timeout: 6000 })
				.toBe("success");
			expect(await example.locator(SLOT_ITEM_NAME).textContent()).toBe(
				"release.pdf"
			);
			expect(
				await example.getByRole("progressbar").getAttribute("aria-valuenow")
			).toBe("100");
			expect(
				await example.getByRole("button", { name: "Retry upload" }).count()
			).toBe(0);
			await example.screenshot({
				path: `/private/tmp/mizen-upload-complete-${theme}.png`,
			});
		}
	);
	it("blocks disabled selection and removal, pauses the demo, and resumes it", async () => {
		const page = suite.getPage();
		const example = page.locator("#FileUploadDisabledExample");
		expect(await example.locator(SLOT_INPUT).isDisabled()).toBe(true);
		expect(
			await example.getByRole("button", { name: "Choose files" }).isDisabled()
		).toBe(true);
		await example.getByRole("button", { name: "Enable upload" }).click();
		await example.locator(SLOT_INPUT).setInputFiles({
			buffer: Buffer.from("demo"),
			mimeType: "application/pdf",
			name: "disabled.pdf",
		});
		const progress = example.getByRole("progressbar");
		await expect
			.poll(async () => Number(await progress.getAttribute("aria-valuenow")))
			.toBeGreaterThan(0);
		await example.getByRole("button", { name: "Disable upload" }).click();
		const paused = await progress.getAttribute("aria-valuenow");
		expect(
			await example
				.getByRole("button", { name: "Remove disabled.pdf" })
				.isDisabled()
		).toBe(true);
		await page.waitForTimeout(500);
		expect(await progress.getAttribute("aria-valuenow")).toBe(paused);
		await example.screenshot({
			path: "/private/tmp/mizen-upload-disabled-light.png",
		});
		await page.emulateMedia({ colorScheme: "dark" });
		await example.screenshot({
			path: "/private/tmp/mizen-upload-disabled-dark.png",
		});
		await example.getByRole("button", { name: "Enable upload" }).click();
		await expect
			.poll(async () => Number(await progress.getAttribute("aria-valuenow")))
			.toBeGreaterThan(Number(paused));
		await example.getByRole("button", { name: "Remove disabled.pdf" }).click();
		await expect.poll(() => example.locator(SLOT_ITEM).count()).toBe(0);
	});
	it("shows simulated progress and completion in the primary upload card", async () => {
		const page = suite.getPage();
		const preview = page.locator('[data-slot="component-preview"]').first();
		await preview.locator(SLOT_INPUT).setInputFiles({
			buffer: Buffer.from("demo upload"),
			mimeType: "application/pdf",
			name: "release-notes.pdf",
		});
		const progress = preview.getByRole("progressbar");
		expect(
			await preview.locator('[data-slot="file-upload-dropzone"]').count()
		).toBe(1);
		expect(
			await preview
				.locator(
					'[data-slot="file-upload-item-progress"] [data-slot="progress-track"]'
				)
				.count()
		).toBe(1);
		await expect
			.poll(async () => Number(await progress.getAttribute("aria-valuenow")))
			.toBeGreaterThan(0);
		expect(Number(await progress.getAttribute("aria-valuenow"))).toBeLessThan(
			100
		);
		await preview.screenshot({
			path: "/private/tmp/mizen-upload-progress-light.png",
		});
		await page.emulateMedia({ colorScheme: "dark" });
		await preview.screenshot({
			path: "/private/tmp/mizen-upload-progress-dark.png",
		});
		await expect
			.poll(() => progress.getAttribute("aria-valuenow"), { timeout: 6000 })
			.toBe("100");
		expect(
			await preview
				.locator('[data-slot="file-upload-item-status"]')
				.textContent()
		).toBe("Uploaded");
		await preview
			.getByRole("button", { name: "Remove release-notes.pdf" })
			.click();
		await expect
			.poll(() => preview.locator('[data-slot="file-upload-dropzone"]').count())
			.toBe(1);
		await expect
			.poll(() =>
				preview
					.getByRole("button", { name: "Choose files" })
					.evaluate((element) => element === document.activeElement)
			)
			.toBe(true);
	});

	it.each(["light", "dark"] as const)(
		"keeps the primary upload and selected rows aligned at 320px in %s",
		async (theme) => {
			const page = suite.getPage();
			await page.emulateMedia({ colorScheme: theme });
			await page.setViewportSize({ height: 900, width: 320 });
			const preview = page.locator('[data-slot="component-preview"]').first();
			await preview.locator(SLOT_INPUT).setInputFiles({
				buffer: Buffer.from("test pdf"),
				mimeType: "application/pdf",
				name: "northstar-release-specification-final-approved.pdf",
			});
			const frame = await preview.evaluate((element) => ({
				available: element.clientWidth,
				width: element.scrollWidth,
			}));
			expect(frame.width).toBeLessThanOrEqual(frame.available);
			const row = preview.locator(SLOT_ITEM);
			// Measure the row once it has grown open.
			await row.evaluate((element) =>
				Promise.all(element.getAnimations().map((motion) => motion.finished))
			);
			const layout = await row.evaluate((element) => {
				const name = element.querySelector(
					'[data-slot="file-upload-item-name"]'
				);
				const remove = element.querySelector(
					'[data-slot="file-upload-item-remove"]'
				);
				if (!(name && remove)) {
					throw new Error("Missing file row parts");
				}
				const rowBox = element.getBoundingClientRect();
				const removeBox = remove.getBoundingClientRect();
				return {
					available: element.clientWidth,
					removeContained:
						removeBox.top >= rowBox.top && removeBox.right <= rowBox.right,
					whiteSpace: getComputedStyle(name).whiteSpace,
					width: element.scrollWidth,
				};
			});
			expect(layout.width).toBeLessThanOrEqual(layout.available);
			expect(layout.whiteSpace).toBe("normal");
			expect(layout.removeContained).toBe(true);
			await preview.screenshot({
				path: `/private/tmp/mizen-upload-${theme}.png`,
			});
			await row.getByRole("button").click();
			await expect.poll(() => preview.locator(SLOT_ITEM).count()).toBe(0);
		}
	);

	it("renders route with 200 status, exact File Upload heading, and specimen hooks", async () => {
		// Given the documentation server and browser session
		const page = suite.getPage();
		const handle = suite.getHandle();

		// When loading the file-upload component route
		const response = await page.goto(`${handle.url}/components/file-upload`, {
			waitUntil: "networkidle",
		});

		// Then the response status is 200 and route heading is visible
		expect(response?.status()).toBe(200);

		const heading = page.getByRole("heading", {
			exact: true,
			level: 1,
			name: "File Upload",
		});
		expect(await heading.isVisible()).toBe(true);

		// Then specimen hooks are present in document
		expect(await page.locator(HOOK_SPECIMEN).isVisible()).toBe(true);
		expect(await page.locator(HOOK_DROPZONE).isVisible()).toBe(true);
		expect(await page.locator(HOOK_TRIGGER).isVisible()).toBe(true);
		expect(await page.locator(HOOK_LIST).count()).toBe(1);
		expect(
			await page
				.locator(HOOK_SPECIMEN)
				.getByText("Images or PDF up to 5 MB (maximum 3 files)", {
					exact: true,
				})
				.isVisible()
		).toBe(true);
		expect(
			await page
				.locator(HOOK_LIST)
				.evaluate((el) => window.getComputedStyle(el).display)
		).toBe("flex");
	});

	it("hides native input from layout and tab order, exposing accessible button trigger", async () => {
		// Given the rendered file-upload specimen
		const page = suite.getPage();
		const input = page.locator(HOOK_SPECIMEN).locator(SLOT_INPUT);
		const trigger = page.locator(HOOK_SPECIMEN).locator(SLOT_TRIGGER);

		// When evaluating native input and trigger properties
		const inputDisplay = await input.evaluate(
			(el) => window.getComputedStyle(el).display
		);
		const inputType = await input.getAttribute("type");
		const inputTabIndex = await input.evaluate((el) =>
			el instanceof HTMLInputElement ? el.tabIndex : null
		);
		const triggerType = await trigger.getAttribute("type");
		const triggerText = await trigger.evaluate((el) =>
			el.textContent ? el.textContent.trim() : ""
		);
		const triggerRole = page.locator(HOOK_SPECIMEN).getByRole("button", {
			exact: true,
			name: "Choose files",
		});

		// Then native input is display none, type file, and excluded from tab order
		expect(inputDisplay).toBe("none");
		expect(inputType).toBe("file");
		expect(inputTabIndex).toBe(-1);

		// And trigger is a visible button control with accessible name
		expect(await trigger.isVisible()).toBe(true);
		expect(triggerType).toBe("button");
		expect(triggerText).toBe("Choose files");
		expect(await triggerRole.isVisible()).toBe(true);
	});

	it("selects files through the trigger without implying upload progress", async () => {
		// Given the file-upload trigger with an empty item list
		const page = suite.getPage();
		const trigger = page.locator(HOOK_SPECIMEN).locator(SLOT_TRIGGER);
		const filePayloads = [
			{
				buffer: Buffer.from("first file content"),
				mimeType: "application/pdf",
				name: "contract.pdf",
			},
			{
				buffer: Buffer.from("second file content"),
				mimeType: "image/png",
				name: "diagram.png",
			},
			{
				buffer: Buffer.from("third file content"),
				mimeType: "image/jpeg",
				name: "receipt.jpg",
			},
		];

		// When clicking the trigger and selecting three files through filechooser
		const fileChooserPromise = page.waitForEvent("filechooser");
		await trigger.click();
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles(filePayloads);

		// Then the list contains all three selected filenames
		const items = page.locator(HOOK_SPECIMEN).locator(SLOT_ITEM);
		await expect.poll(() => items.count()).toBe(3);

		const names = await page
			.locator(HOOK_SPECIMEN)
			.locator(SLOT_ITEM_NAME)
			.allTextContents();
		expect(names).toEqual(["contract.pdf", "diagram.png", "receipt.jpg"]);

		// Selected files remain pending until the application starts uploading.
		expect(
			await items
				.locator('[data-slot="file-upload-item-status"][data-status="pending"]')
				.count()
		).toBe(3);
		expect(await page.getByRole("progressbar").count()).toBe(0);
	});

	it("displays visible rejection message and adds no list item for unsupported file", async () => {
		// Given the file-upload specimen
		const page = suite.getPage();
		const trigger = page.locator(HOOK_SPECIMEN).locator(SLOT_TRIGGER);

		// When selecting an unsupported file format via filechooser
		const fileChooserPromise = page.waitForEvent("filechooser");
		await trigger.click();
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles([
			{
				buffer: Buffer.from("plain text content"),
				mimeType: "text/plain",
				name: "notes.txt",
			},
		]);

		// Then the visible rejection message appears on screen
		const rejection = page
			.locator(HOOK_SPECIMEN)
			.getByText("notes.txt isn't an image or PDF.");
		await expect.poll(() => rejection.isVisible()).toBe(true);

		// And no file item is added to the list
		const items = page.locator(HOOK_SPECIMEN).locator(SLOT_ITEM);
		expect(await items.count()).toBe(0);
	});

	it("removes file from list and restores focus to visible trigger when single item is deleted", async () => {
		// Given a selected file in the list
		const page = suite.getPage();
		const trigger = page.locator(HOOK_SPECIMEN).locator(SLOT_TRIGGER);

		const fileChooserPromise = page.waitForEvent("filechooser");
		await trigger.click();
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles([
			{
				buffer: Buffer.from("single file content"),
				mimeType: "image/png",
				name: "avatar.png",
			},
		]);

		const removeButton = page.getByRole("button", {
			exact: true,
			name: "Remove avatar.png",
		});
		await expect.poll(() => removeButton.isVisible()).toBe(true);

		// When clicking the remove button
		await removeButton.click();

		// Then the list becomes empty
		const items = page.locator(HOOK_SPECIMEN).locator(SLOT_ITEM);
		await expect.poll(() => items.count()).toBe(0);

		// And focus is restored to the visible trigger button
		await expect
			.poll(() => trigger.evaluate((el) => el === document.activeElement))
			.toBe(true);
	});
});
