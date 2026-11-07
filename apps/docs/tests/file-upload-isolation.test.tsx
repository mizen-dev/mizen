// @vitest-environment happy-dom
import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { describe, expect, it, vi } from "vitest";
import type {
	FileRejection,
	FileUploadChangeDetails,
} from "../../../packages/ui/src/components/file-upload/file-upload";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadInput,
} from "../../../packages/ui/src/components/file-upload/file-upload";
import {
	createMockFile,
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

describe("FileUpload transaction isolation for controlled revisions and nested rejection records", () => {
	it("preserves authoritative native input and form data when flushSync parent commits then cancels callback", () => {
		const f1 = createMockFile("initial.txt", 100, "text/plain");
		const f2 = createMockFile("updated.txt", 200, "text/plain");

		function ControlledCancelParent() {
			const [files, setFiles] = useState<readonly File[]>([f1]);
			const handleValueChange = useCallback(
				(nextFiles: readonly File[], details: FileUploadChangeDetails) => {
					flushSync(() => {
						setFiles(nextFiles);
					});
					details.cancel();
				},
				[]
			);

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

		const { container, unmount } = mount(<ControlledCancelParent />);
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

	it("preserves authoritative native input and form data when flushSync parent commits then throws in callback", () => {
		const f1 = createMockFile("initial.txt", 100, "text/plain");
		const f2 = createMockFile("updated.txt", 200, "text/plain");

		function ControlledThrowParent() {
			const [files, setFiles] = useState<readonly File[]>([f1]);
			const handleValueChange = useCallback((nextFiles: readonly File[]) => {
				flushSync(() => {
					setFiles(nextFiles);
				});
				throw new Error("consumer error after flushSync");
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

		const { container, unmount } = mount(<ControlledThrowParent />);
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

	it("isolates nested rejection records against consumer mutation via Reflect.set", () => {
		const invalidFile = createMockFile(
			"payload.exe",
			100,
			"application/x-msdownload"
		);
		const replacementFile = createMockFile("hacked.txt", 50, "text/plain");
		let capturedRejectionInDetails: FileRejection | undefined;

		const handleFileReject = vi.fn((rejections: readonly FileRejection[]) => {
			const [target] = rejections;
			if (target) {
				Reflect.set(target, "code", "too-many-files");
				Reflect.set(target, "file", replacementFile);
			}
		});

		const handleValueChange = vi.fn(
			(_files: readonly File[], details: FileUploadChangeDetails) => {
				if ("rejected" in details) {
					const [firstRejected] = details.rejected;
					if (firstRejected) {
						capturedRejectionInDetails = firstRejected;
					}
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
		expect(liveRegion?.textContent).toContain("Rejected payload.exe");
		expect(capturedRejectionInDetails?.code).toBe("file-invalid-type");
		expect(capturedRejectionInDetails?.file).toBe(invalidFile);
		unmount();
	});

	it("rolls native input back to prior committed state when callback cancels without flushSync revision", () => {
		const f1 = createMockFile("initial.txt", 100, "text/plain");
		const f2 = createMockFile("incoming.txt", 200, "text/plain");

		function ControlledNoFlushCancelParent() {
			const handleValueChange = useCallback(
				(_nextFiles: readonly File[], details: FileUploadChangeDetails) => {
					details.cancel();
				},
				[]
			);

			return (
				<form data-slot="test-form">
					<FileUpload
						name="attachments"
						onValueChange={handleValueChange}
						value={[f1]}
					>
						<FileUploadInput />
					</FileUpload>
				</form>
			);
		}

		const { container, unmount } = mount(<ControlledNoFlushCancelParent />);
		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		const form = getSlot<HTMLFormElement>(container, "test-form");
		expect(Array.from(input?.files ?? [])).toEqual([f1]);

		triggerSelect(container, [f2]);

		expect(Array.from(input?.files ?? [])).toEqual([f1]);
		if (form) {
			expect(new FormData(form).getAll("attachments")).toEqual([f1]);
		}
		unmount();
	});
});
