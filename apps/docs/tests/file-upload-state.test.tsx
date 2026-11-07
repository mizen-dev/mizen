// @vitest-environment happy-dom
import { act, useCallback, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadInput,
	FileUploadItem,
	FileUploadItemName,
	FileUploadItemRemove,
	FileUploadItemSize,
	FileUploadList,
} from "../../../packages/ui/src/components/file-upload/file-upload";
import {
	createMockFile,
	getAllSlots,
	getSlot,
	mount,
	triggerDrop,
	triggerSelect,
} from "./file-upload-test-helpers";

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

const renderItem = (file: File, index: number) => (
	<FileUploadItem file={file} index={index} key={index}>
		<FileUploadItemName>{file.name}</FileUploadItemName>
		<FileUploadItemSize />
		<FileUploadItemRemove />
	</FileUploadItem>
);

describe("FileUpload state management, value changes, and controlledness", () => {
	it("supports controlled and uncontrolled updates with change details", () => {
		const onValueChange = vi.fn();
		const file = createMockFile("doc.pdf", 500, "application/pdf");

		const { container, unmount } = mount(
			<FileUpload onValueChange={onValueChange}>
				<FileUploadInput />
				<FileUploadDropzone />
			</FileUpload>
		);

		triggerSelect(container, [file]);

		const details = { accepted: [file], reason: "picker", rejected: [] };
		expect(onValueChange).toHaveBeenCalledWith(
			[file],
			expect.objectContaining(details)
		);
		unmount();
	});

	it("rolls back state synchronously when consumer invokes details.cancel()", () => {
		const f1 = createMockFile("existing.txt", 100, "text/plain");
		const f2 = createMockFile("incoming.txt", 100, "text/plain");

		const onValueChange = vi.fn((_f: File[], d: { cancel: () => void }) =>
			d.cancel()
		);

		const { container, unmount } = mount(
			<FileUpload defaultValue={[f1]} onValueChange={onValueChange}>
				<FileUploadInput />
				<FileUploadList>{renderItem}</FileUploadList>
			</FileUpload>
		);

		triggerSelect(container, [f2]);

		expect(onValueChange).toHaveBeenCalledTimes(1);
		const items = getAllSlots(container, "file-upload-item-name");
		expect(items[0]?.textContent).toBe("existing.txt");
		unmount();
	});

	it("partially accepts valid files and rejects invalid files during drop", () => {
		const valid = createMockFile("valid.png", 500, "image/png");
		const invalid = createMockFile("bad.exe", 500, "application/x-msdownload");
		const onFileReject = vi.fn();
		const onValueChange = vi.fn();

		const { container, unmount } = mount(
			<FileUpload
				accept="image/*"
				onFileReject={onFileReject}
				onValueChange={onValueChange}
			>
				<FileUploadDropzone />
			</FileUpload>
		);

		triggerDrop(container, [valid, invalid]);

		const rejected = [{ code: "file-invalid-type", file: invalid }];
		expect(onFileReject).toHaveBeenCalledWith(rejected);
		const changeDetails = { accepted: [valid], reason: "drop", rejected };
		expect(onValueChange).toHaveBeenCalledWith(
			[valid],
			expect.objectContaining(changeDetails)
		);
		unmount();
	});

	it("pins controlledness from first render and ignores switch directions", () => {
		const f1 = createMockFile("initial.txt", 100, "text/plain");
		const f2 = createMockFile("switched.txt", 100, "text/plain");

		function UncontrolledToControlledHarness() {
			const [passValue, setPassValue] = useState(false);
			const handleSwitch = useCallback(() => setPassValue(true), []);
			return (
				<div>
					<button data-slot="toggle-btn" onClick={handleSwitch} type="button">
						Switch
					</button>
					<FileUpload defaultValue={[f1]} value={passValue ? [f2] : undefined}>
						<FileUploadList>{renderItem}</FileUploadList>
					</FileUpload>
				</div>
			);
		}

		const { container: c1, unmount: u1 } = mount(
			<UncontrolledToControlledHarness />
		);
		let names = getAllSlots(c1, "file-upload-item-name");
		expect(names[0]?.textContent).toBe("initial.txt");

		const btn1 = getSlot<HTMLButtonElement>(c1, "toggle-btn");
		act(() => btn1?.click());

		names = getAllSlots(c1, "file-upload-item-name");
		expect(names[0]?.textContent).toBe("initial.txt");
		u1();

		function ControlledToUncontrolledHarness() {
			const [passValue, setPassValue] = useState(true);
			const handleSwitch = useCallback(() => setPassValue(false), []);
			return (
				<div>
					<button data-slot="toggle-btn" onClick={handleSwitch} type="button">
						Switch
					</button>
					<FileUpload value={passValue ? [f1] : undefined}>
						<FileUploadList>{renderItem}</FileUploadList>
					</FileUpload>
				</div>
			);
		}

		const { container: c2, unmount: u2 } = mount(
			<ControlledToUncontrolledHarness />
		);
		names = getAllSlots(c2, "file-upload-item-name");
		expect(names[0]?.textContent).toBe("initial.txt");

		const btn2 = getSlot<HTMLButtonElement>(c2, "toggle-btn");
		act(() => btn2?.click());

		names = getAllSlots(c2, "file-upload-item-name");
		expect(names).toHaveLength(0);
		u2();
	});

	it("causes DOM mutation on repeated identical rejections via keyed child in stable live region", () => {
		const badFile = createMockFile("bad.exe", 100, "application/x-msdownload");
		const { container, unmount } = mount(
			<FileUpload accept="image/*">
				<FileUploadDropzone />
			</FileUpload>
		);

		const liveRegion = container.querySelector('[aria-live="polite"]');
		expect(liveRegion).not.toBeNull();

		triggerDrop(container, [badFile]);
		expect(liveRegion?.textContent).toContain("Rejected bad.exe");
		const firstChild = liveRegion?.firstElementChild;
		expect(firstChild).not.toBeNull();

		triggerDrop(container, [badFile]);
		expect(liveRegion?.textContent).toContain("Rejected bad.exe");
		const secondChild = liveRegion?.firstElementChild;
		expect(secondChild).not.toBeNull();
		expect(secondChild).not.toBe(firstChild);

		unmount();
	});
});
