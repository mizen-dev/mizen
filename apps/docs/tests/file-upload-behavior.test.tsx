// @vitest-environment happy-dom
import { act, useCallback, useState } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadInput,
	FileUploadItem,
	FileUploadItemName,
	FileUploadItemRemove,
	FileUploadItemSize,
	FileUploadList,
	FileUploadTrigger,
} from "../../../packages/ui/src/components/file-upload/file-upload";
import {
	createMockFile,
	getAllSlots,
	getSlot,
	mount,
	triggerDrop,
} from "./file-upload-test-helpers";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	createTheme: <T extends object>(_v: T, o: object): object => o,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: {
		ancestor: () => ":where(*)",
	},
}));
function Harness({ f1, f2 }: { f1: File; f2: File }) {
	const [files, setFiles] = useState([f1, f2]);
	const handleValueChange = useCallback(
		(nextFiles: readonly File[]) => setFiles([...nextFiles]),
		[]
	);
	return (
		<FileUpload accept=".txt" onValueChange={handleValueChange} value={files}>
			<FileUploadDropzone>
				<FileUploadTrigger>Upload</FileUploadTrigger>
			</FileUploadDropzone>
			<FileUploadList>{renderItem}</FileUploadList>
		</FileUpload>
	);
}
const renderItem = (file: File, index: number) => (
	<FileUploadItem file={file} index={index} key={index}>
		<FileUploadItemName>{file.name}</FileUploadItemName>
		<FileUploadItemSize />
		<FileUploadItemRemove />
	</FileUploadItem>
);
describe("FileUpload component interactions and DOM behavior", () => {
	it("renders default anatomy slots when composed with standard primitives", () => {
		const file = createMockFile("a.txt", 100, "text/plain");
		const { container, unmount } = mount(
			<FileUpload defaultValue={[file]}>
				<FileUploadDropzone>
					<FileUploadTrigger>Upload</FileUploadTrigger>
				</FileUploadDropzone>
				<FileUploadInput />
				<FileUploadList>{renderItem(file, 0)}</FileUploadList>
			</FileUpload>
		);
		const allPresent = [
			"file-upload",
			"file-upload-dropzone",
			"file-upload-trigger",
			"file-upload-input",
			"file-upload-list",
			"file-upload-item",
			"file-upload-item-name",
		].every((slot) => getSlot(container, slot) !== null);
		expect(allPresent).toBe(true);
		unmount();
	});
	it("supports render-function item and index seam on FileUploadList", () => {
		const f1 = createMockFile("a.txt", 100, "text/plain");
		const f2 = createMockFile("b.txt", 200, "text/plain");
		const indices: number[] = [];
		const { container, unmount } = mount(
			<FileUpload defaultValue={[f1, f2]}>
				<FileUploadList>
					{(file, index) => {
						indices.push(index);
						return renderItem(file, index);
					}}
				</FileUploadList>
			</FileUpload>
		);
		expect(indices).toEqual([0, 1]);
		const names = getAllSlots(container, "file-upload-item-name");
		expect(names[0]?.textContent).toBe("a.txt");
		expect(names[1]?.textContent).toBe("b.txt");
		unmount();
	});
	it("removes exact index among duplicate file references and sets accessible label", async () => {
		const file = createMockFile("dup.pdf", 300, "application/pdf");
		const onValueChange = vi.fn();
		const { container, unmount } = mount(
			<FileUpload defaultValue={[file, file]} onValueChange={onValueChange}>
				<FileUploadList>{renderItem}</FileUploadList>
			</FileUpload>
		);
		const removeButtons = getAllSlots<HTMLButtonElement>(
			container,
			"file-upload-item-remove"
		);
		expect(removeButtons).toHaveLength(2);
		expect(removeButtons[0]?.getAttribute("aria-label")).toBe("Remove dup.pdf");
		const defaultSvg = removeButtons[0]?.querySelector("svg");
		expect(defaultSvg?.getAttribute("aria-hidden")).toBe("true");
		expect(defaultSvg?.getAttribute("viewBox")).toBe("0 0 24 24");
		act(() => removeButtons[0]?.click());
		const details = {
			file,
			index: 0,
			reason: "remove",
		};
		// The row collapses before the removal commits.
		await vi.waitFor(() =>
			expect(onValueChange).toHaveBeenCalledWith(
				[file],
				expect.objectContaining(details)
			)
		);
		unmount();
	});
	it("manages focus restoration and live announcements on removal and rejection", async () => {
		const f1 = createMockFile("f1.txt", 100, "text/plain");
		const f2 = createMockFile("f2.txt", 100, "text/plain");
		const { container, unmount } = mount(<Harness f1={f1} f2={f2} />);
		const removeButtons = getAllSlots<HTMLButtonElement>(
			container,
			"file-upload-item-remove"
		);
		await act(async () => {
			removeButtons[0]?.focus();
			removeButtons[0]?.click();
			await Promise.resolve();
		});
		const liveRegion = container.querySelector('[aria-live="polite"]');
		await vi.waitFor(() => expect(liveRegion?.textContent).toContain("f1.txt"));
		expect(document.activeElement).toBe(
			getSlot(container, "file-upload-item-remove")
		);
		triggerDrop(container, [createMockFile("bad.png", 100, "image/png")]);
		expect(liveRegion?.textContent).toContain("Rejected bad.png");
		unmount();
	});
	it("protects internal input slot attributes against external overwrite", () => {
		const { container, unmount } = mount(
			<FileUpload>
				<FileUploadInput />
			</FileUpload>
		);
		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		expect(input?.getAttribute("type")).toBe("file");
		expect(input?.tabIndex).toBe(-1);
		unmount();
	});
});
