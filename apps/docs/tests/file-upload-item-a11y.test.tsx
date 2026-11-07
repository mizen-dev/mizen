// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import {
	FileUpload,
	FileUploadItem,
	FileUploadItemName,
	FileUploadItemProgress,
	FileUploadItemRemove,
	FileUploadList,
} from "../../../packages/ui/src/components/file-upload/file-upload";
import { createMockFile, getSlot, mount } from "./file-upload-test-helpers";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	createTheme: <T extends object>(_v: T, o: object): object => o,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

describe("FileUploadItem accessibility and presentation slots", () => {
	it("wraps item children in internal file-upload-item-content slot and preserves item ref", () => {
		const file = createMockFile("doc.pdf", 200, "application/pdf");
		let itemRef: HTMLLIElement | null = null;
		const setItemRef = (node: HTMLLIElement | null) => {
			itemRef = node;
		};

		const { container, unmount } = mount(
			<FileUpload defaultValue={[file]}>
				<FileUploadList>
					<FileUploadItem file={file} index={0} ref={setItemRef}>
						<FileUploadItemName />
					</FileUploadItem>
				</FileUploadList>
			</FileUpload>
		);

		const item = getSlot(container, "file-upload-item");
		expect(item).not.toBeNull();
		expect(itemRef).toBe(item);

		const content = getSlot(container, "file-upload-item-content");
		expect(content).not.toBeNull();
		expect(content?.parentElement).toBe(item);
		expect(
			content?.querySelector('[data-slot="file-upload-item-name"]')
		).not.toBeNull();

		unmount();
	});

	it("provides filename-based default accessible name to nested progressbar", () => {
		const file = createMockFile("report.pdf", 300, "application/pdf");
		const { container, unmount } = mount(
			<FileUpload defaultValue={[file]}>
				<FileUploadList>
					<FileUploadItem file={file} index={0}>
						<FileUploadItemProgress value={45} />
					</FileUploadItem>
				</FileUploadList>
			</FileUpload>
		);

		const progress = getSlot(container, "progress");
		expect(progress?.getAttribute("aria-label")).toBe("report.pdf progress");

		const progressWrapper = getSlot(container, "file-upload-item-progress");
		expect(progressWrapper?.getAttribute("aria-label")).toBeNull();

		unmount();
	});

	it("allows consumer to override progress accessible name via aria-label", () => {
		const file = createMockFile("report.pdf", 300, "application/pdf");
		const { container, unmount } = mount(
			<FileUpload defaultValue={[file]}>
				<FileUploadList>
					<FileUploadItem file={file} index={0}>
						<FileUploadItemProgress aria-label="Upload progress" value={60} />
					</FileUploadItem>
				</FileUploadList>
			</FileUpload>
		);

		const progress = getSlot(container, "progress");
		expect(progress?.getAttribute("aria-label")).toBe("Upload progress");

		const progressWrapper = getSlot(container, "file-upload-item-progress");
		expect(progressWrapper?.getAttribute("aria-label")).toBeNull();

		unmount();
	});

	it("allows consumer to override progress accessible name via aria-labelledby", () => {
		const file = createMockFile("report.pdf", 300, "application/pdf");
		const { container, unmount } = mount(
			<FileUpload defaultValue={[file]}>
				<span id="custom-label-id">Upload progress description</span>
				<FileUploadList>
					<FileUploadItem file={file} index={0}>
						<FileUploadItemProgress
							aria-labelledby="custom-label-id"
							value={80}
						/>
					</FileUploadItem>
				</FileUploadList>
			</FileUpload>
		);

		const labelElement = container.querySelector("#custom-label-id");
		expect(labelElement).not.toBeNull();
		expect(labelElement?.textContent).toBe("Upload progress description");

		const progress = getSlot(container, "progress");
		expect(progress?.getAttribute("aria-labelledby")).toBe("custom-label-id");
		expect(progress?.getAttribute("aria-label")).toBeNull();

		const progressWrapper = getSlot(container, "file-upload-item-progress");
		expect(progressWrapper?.getAttribute("aria-labelledby")).toBeNull();

		unmount();
	});

	it("provides default remove button aria-label when not overridden", () => {
		const file = createMockFile("data.csv", 400, "text/csv");
		const { container, unmount } = mount(
			<FileUpload defaultValue={[file]}>
				<FileUploadList>
					<FileUploadItem file={file} index={0}>
						<FileUploadItemRemove />
					</FileUploadItem>
				</FileUploadList>
			</FileUpload>
		);

		const removeBtn = getSlot(container, "file-upload-item-remove");
		expect(removeBtn?.getAttribute("aria-label")).toBe("Remove data.csv");

		unmount();
	});

	it("allows consumer to override remove button aria-label", () => {
		const file = createMockFile("data.csv", 400, "text/csv");
		const { container, unmount } = mount(
			<FileUpload defaultValue={[file]}>
				<FileUploadList>
					<FileUploadItem file={file} index={0}>
						<FileUploadItemRemove aria-label="Delete data.csv permanently" />
					</FileUploadItem>
				</FileUploadList>
			</FileUpload>
		);

		const removeBtn = getSlot(container, "file-upload-item-remove");
		expect(removeBtn?.getAttribute("aria-label")).toBe(
			"Delete data.csv permanently"
		);

		unmount();
	});

	it("keeps a filename-based accessible name when custom children have no text", () => {
		const file = createMockFile("data.csv", 400, "text/csv");
		const { container, unmount } = mount(
			<FileUpload defaultValue={[file]}>
				<FileUploadList>
					<FileUploadItem file={file} index={0}>
						<FileUploadItemRemove>
							<svg aria-hidden="true" />
						</FileUploadItemRemove>
					</FileUploadItem>
				</FileUploadList>
			</FileUpload>
		);

		const removeBtn = getSlot(container, "file-upload-item-remove");
		expect(removeBtn?.getAttribute("aria-label")).toBeNull();
		expect(removeBtn?.textContent).toContain("Remove data.csv");

		unmount();
	});

	it("preserves visible text and adds a visually hidden action name", () => {
		const file = createMockFile("data.csv", 400, "text/csv");
		const { container, unmount } = mount(
			<FileUpload defaultValue={[file]}>
				<FileUploadList>
					<FileUploadItem file={file} index={0}>
						<FileUploadItemRemove>
							<span>Delete file</span>
						</FileUploadItemRemove>
					</FileUploadItem>
				</FileUploadList>
			</FileUpload>
		);

		const removeBtn = getSlot(container, "file-upload-item-remove");
		expect(removeBtn?.getAttribute("aria-label")).toBeNull();
		expect(removeBtn?.textContent).toContain("Delete file");
		expect(removeBtn?.textContent).toContain("Remove data.csv");
		expect(removeBtn?.querySelector("span")?.hasAttribute("aria-hidden")).toBe(
			false
		);

		unmount();
	});

	it("prioritizes explicit consumer aria-label over custom children on remove button", () => {
		const file = createMockFile("data.csv", 400, "text/csv");
		const { container, unmount } = mount(
			<FileUpload defaultValue={[file]}>
				<FileUploadList>
					<FileUploadItem file={file} index={0}>
						<FileUploadItemRemove aria-label="Delete data.csv permanently">
							<span>Delete</span>
						</FileUploadItemRemove>
					</FileUploadItem>
				</FileUploadList>
			</FileUpload>
		);

		const removeBtn = getSlot(container, "file-upload-item-remove");
		const ariaLabel = removeBtn?.getAttribute("aria-label");
		const visibleText = removeBtn?.textContent?.trim() ?? "";
		expect(ariaLabel).toBe("Delete data.csv permanently");
		expect(ariaLabel).toContain(visibleText);

		unmount();
	});

	it("prioritizes explicit consumer aria-labelledby over custom children on remove button", () => {
		const file = createMockFile("data.csv", 400, "text/csv");
		const { container, unmount } = mount(
			<FileUpload defaultValue={[file]}>
				<h3 id="custom-remove-heading">Remove attached receipt</h3>
				<FileUploadList>
					<FileUploadItem file={file} index={0}>
						<FileUploadItemRemove aria-labelledby="custom-remove-heading">
							<span>Remove</span>
						</FileUploadItemRemove>
					</FileUploadItem>
				</FileUploadList>
			</FileUpload>
		);

		const labelElement = container.querySelector("#custom-remove-heading");
		expect(labelElement).not.toBeNull();
		expect(labelElement?.textContent).toBe("Remove attached receipt");

		const removeBtn = getSlot(container, "file-upload-item-remove");
		expect(removeBtn?.getAttribute("aria-labelledby")).toBe(
			"custom-remove-heading"
		);
		expect(removeBtn?.getAttribute("aria-label")).toBeNull();
		const visibleText = removeBtn?.textContent?.trim() ?? "";
		expect(labelElement?.textContent).toContain(visibleText);

		unmount();
	});
});
