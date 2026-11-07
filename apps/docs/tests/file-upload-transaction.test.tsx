// @vitest-environment happy-dom
import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { describe, expect, it, vi } from "vitest";
import type {
	FileRejection,
	FileUploadChangeDetails,
	FileUploadProps,
} from "../../../packages/ui/src/components/file-upload/file-upload";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadInput,
	FileUploadItem,
	FileUploadItemName,
	FileUploadItemRemove,
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

type Assert<T extends true> = T;

type ParamFiles = Parameters<NonNullable<FileUploadProps["onValueChange"]>>[0];
type ParamReject = Parameters<NonNullable<FileUploadProps["onFileReject"]>>[0];

type _FilesIsReadonly = Assert<
	ParamFiles extends readonly File[] ? true : false
>;
type _FilesIsNotMutable = Assert<[ParamFiles] extends [File[]] ? false : true>;

type _RejectionsIsReadonly = Assert<
	ParamReject extends readonly FileRejection[] ? true : false
>;
type _RejectionsIsNotMutable = Assert<
	[ParamReject] extends [FileRejection[]] ? false : true
>;

describe("FileUpload transaction isolation and controlled synchronous-parent commits", () => {
	it("preserves authoritative native input files when controlled parent synchronously commits via flushSync", () => {
		const f1 = createMockFile("initial.txt", 100, "text/plain");
		const f2 = createMockFile("updated.txt", 200, "text/plain");

		function ControlledParent() {
			const [files, setFiles] = useState<readonly File[]>([f1]);
			const handleValueChange = useCallback((nextFiles: readonly File[]) => {
				flushSync(() => {
					setFiles(nextFiles);
				});
			}, []);

			return (
				<form data-slot="test-form">
					<FileUpload
						name="attachments"
						onValueChange={handleValueChange}
						value={files}
					>
						<FileUploadInput />
					</FileUpload>
				</form>
			);
		}

		const { container, unmount } = mount(<ControlledParent />);
		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		const form = getSlot<HTMLFormElement>(container, "test-form");
		expect(Array.from(input?.files ?? [])).toEqual([f1]);

		triggerSelect(container, [f2]);

		expect(Array.from(input?.files ?? [])).toEqual([f2]);
		if (form) {
			expect(new FormData(form).getAll("attachments")).toEqual([f2]);
		}
		unmount();
	});

	it("preserves authoritative native input files when flushSync commits a different value than incoming candidate", () => {
		const f1 = createMockFile("f1.txt", 100, "text/plain");
		const candidate = createMockFile("candidate.txt", 200, "text/plain");
		const authoritative = createMockFile(
			"authoritative.txt",
			300,
			"text/plain"
		);

		function SynchronousOverrideParent() {
			const [files, setFiles] = useState<readonly File[]>([f1]);
			const handleValueChange = useCallback(() => {
				flushSync(() => {
					setFiles([authoritative]);
				});
			}, []);

			return (
				<FileUpload onValueChange={handleValueChange} value={files}>
					<FileUploadInput />
				</FileUpload>
			);
		}

		const { container, unmount } = mount(<SynchronousOverrideParent />);
		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		expect(Array.from(input?.files ?? [])).toEqual([f1]);

		triggerSelect(container, [candidate]);

		expect(Array.from(input?.files ?? [])).toEqual([authoritative]);
		unmount();
	});

	it("rolls native input back to existing prop when controlled parent ignores onValueChange", () => {
		const f1 = createMockFile("existing.txt", 100, "text/plain");
		const f2 = createMockFile("ignored.txt", 200, "text/plain");
		const onValueChange = vi.fn();

		const { container, unmount } = mount(
			<form data-slot="test-form">
				<FileUpload name="docs" onValueChange={onValueChange} value={[f1]}>
					<FileUploadInput />
				</FileUpload>
			</form>
		);

		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		const form = getSlot<HTMLFormElement>(container, "test-form");
		expect(Array.from(input?.files ?? [])).toEqual([f1]);

		triggerSelect(container, [f2]);

		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(Array.from(input?.files ?? [])).toEqual([f1]);
		if (form) {
			expect(new FormData(form).getAll("docs")).toEqual([f1]);
		}
		unmount();
	});

	it("retains rejected filename in live region and change details when onFileReject mutates rejections array", () => {
		const invalidFile = createMockFile(
			"malicious.exe",
			100,
			"application/x-msdownload"
		);
		let capturedRejectedInDetails: readonly unknown[] = [];

		const handleFileReject = vi.fn((rejections: readonly FileRejection[]) => {
			Reflect.set(rejections, "length", 0);
		});

		const handleValueChange = vi.fn(
			(_files: readonly File[], details: FileUploadChangeDetails) => {
				if ("rejected" in details) {
					capturedRejectedInDetails = [...details.rejected];
				}
			}
		);

		const { container, unmount } = mount(
			<FileUpload
				accept="image/*"
				onFileReject={handleFileReject}
				onValueChange={handleValueChange}
			>
				<FileUploadDropzone />
			</FileUpload>
		);

		const liveRegion = container.querySelector('[aria-live="polite"]');
		triggerDrop(container, [invalidFile]);

		expect(handleFileReject).toHaveBeenCalledTimes(1);
		expect(liveRegion?.textContent).toContain("Rejected malicious.exe");
		expect(capturedRejectedInDetails).toHaveLength(1);
		unmount();
	});

	it("isolates internal state and native input when onValueChange mutates emitted files array", () => {
		const file = createMockFile("sample.txt", 150, "text/plain");
		const handleValueChange = vi.fn((files: readonly File[]) => {
			Reflect.set(files, "length", 0);
		});

		const { container, unmount } = mount(
			<FileUpload onValueChange={handleValueChange}>
				<FileUploadInput />
				<FileUploadList>
					{(f, i) => (
						<FileUploadItem file={f} index={i} key={i}>
							<FileUploadItemName>{f.name}</FileUploadItemName>
							<FileUploadItemRemove />
						</FileUploadItem>
					)}
				</FileUploadList>
			</FileUpload>
		);

		triggerSelect(container, [file]);

		expect(handleValueChange).toHaveBeenCalledTimes(1);
		const items = getAllSlots(container, "file-upload-item-name");
		expect(items).toHaveLength(1);
		expect(items[0]?.textContent).toBe("sample.txt");

		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		expect(Array.from(input?.files ?? [])).toEqual([file]);
		unmount();
	});

	it("isolates internal change details when consumer mutates accepted or rejected arrays", () => {
		const valid = createMockFile("image.png", 200, "image/png");
		const invalid = createMockFile("script.sh", 100, "application/x-sh");

		const handleValueChange = vi.fn(
			(_files: readonly File[], details: FileUploadChangeDetails) => {
				if ("accepted" in details) {
					Reflect.set(details.accepted, "length", 0);
				}
				if ("rejected" in details) {
					Reflect.set(details.rejected, "length", 0);
				}
			}
		);

		const { container, unmount } = mount(
			<FileUpload accept="image/*" onValueChange={handleValueChange}>
				<FileUploadInput />
				<FileUploadDropzone />
				<FileUploadList>
					{(f, i) => (
						<FileUploadItem file={f} index={i} key={i}>
							<FileUploadItemName>{f.name}</FileUploadItemName>
						</FileUploadItem>
					)}
				</FileUploadList>
			</FileUpload>
		);

		triggerDrop(container, [valid, invalid]);

		expect(handleValueChange).toHaveBeenCalledTimes(1);
		const items = getAllSlots(container, "file-upload-item-name");
		expect(items).toHaveLength(1);
		expect(items[0]?.textContent).toBe("image.png");
		unmount();
	});
});
