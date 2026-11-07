// @vitest-environment happy-dom
import { act, useCallback } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadInput,
	FileUploadItem,
	FileUploadItemName,
	FileUploadItemRemove,
	FileUploadList,
	FileUploadTrigger,
} from "../../../packages/ui/src/components/file-upload/file-upload";
import {
	createMockFile,
	getAllSlots,
	getSlot,
	mount,
	selectFiles,
	triggerDrop,
	triggerSelect,
} from "./file-upload-test-helpers";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	createTheme: <T extends object>(_variables: T, overrides: object): object =>
		overrides,
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
		<FileUploadItemRemove />
	</FileUploadItem>
);

describe("FileUpload form integration, input synchronization, and rollback", () => {
	it("keeps input.files and FormData equal across picker, drop, and remove", async () => {
		const f1 = createMockFile("one.txt", 100, "text/plain");
		const f2 = createMockFile("two.txt", 200, "text/plain");

		const { container, unmount } = mount(
			<form data-slot="test-form">
				<FileUpload maxFiles={2} name="attachments">
					<FileUploadInput />
					<FileUploadDropzone />
					<FileUploadList>{renderItem}</FileUploadList>
				</FileUpload>
			</form>
		);

		const form = getSlot<HTMLFormElement>(container, "test-form");
		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		expect(form).not.toBeNull();
		expect(input).not.toBeNull();

		if (form && input) {
			triggerSelect(container, [f1]);
			expect(Array.from(input.files ?? [])).toEqual([f1]);
			expect(new FormData(form).getAll("attachments")).toEqual([f1]);

			triggerDrop(container, [f2]);
			expect(Array.from(input.files ?? [])).toEqual([f1, f2]);
			expect(new FormData(form).getAll("attachments")).toEqual([f1, f2]);

			const removeButtons = getAllSlots<HTMLButtonElement>(
				container,
				"file-upload-item-remove"
			);
			act(() => removeButtons[0]?.click());

			// The row collapses before the removal commits.
			await vi.waitFor(() =>
				expect(Array.from(input.files ?? [])).toEqual([f2])
			);
			expect(new FormData(form).getAll("attachments")).toEqual([f2]);
		}

		unmount();
	});

	it("prevents synthetic change and input event recursion during mirroring", () => {
		const file = createMockFile("data.csv", 300, "text/csv");
		const changeListener = vi.fn();
		const inputListener = vi.fn();
		const onValueChange = vi.fn();

		const { container, unmount } = mount(
			<FileUpload name="files" onValueChange={onValueChange}>
				<FileUploadInput />
			</FileUpload>
		);

		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		input?.addEventListener("change", changeListener);
		input?.addEventListener("input", inputListener);

		if (input) {
			triggerSelect(container, [file]);
		}

		expect(changeListener).toHaveBeenCalledTimes(1);
		expect(inputListener).toHaveBeenCalledTimes(0);
		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange).toHaveBeenCalledWith(
			[file],
			expect.objectContaining({ reason: "picker" })
		);
		unmount();
	});

	it("clears native input value so same-file can be selected after removal", async () => {
		const file = createMockFile("report.pdf", 400, "application/pdf");
		const onValueChange = vi.fn();

		const { container, unmount } = mount(
			<FileUpload onValueChange={onValueChange}>
				<FileUploadInput />
				<FileUploadList>{renderItem}</FileUploadList>
			</FileUpload>
		);

		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		triggerSelect(container, [file]);
		expect(onValueChange).toHaveBeenCalledTimes(1);

		const removeBtn = getSlot<HTMLButtonElement>(
			container,
			"file-upload-item-remove"
		);
		act(() => removeBtn?.click());
		await vi.waitFor(() => expect(input?.value).toBe(""));
		expect(onValueChange).toHaveBeenNthCalledWith(
			2,
			[],
			expect.objectContaining({ reason: "remove" })
		);

		if (input) {
			act(() => selectFiles(input, [file]));
		}
		expect(onValueChange).toHaveBeenCalledTimes(3);
		expect(onValueChange).toHaveBeenNthCalledWith(
			3,
			[file],
			expect.objectContaining({ reason: "picker" })
		);

		unmount();
	});

	it("synchronizes native input to validated candidate collection before onFileReject and onValueChange for synchronous FormData", () => {
		const committed = createMockFile("c.txt", 100, "text/plain");
		const valid = createMockFile("valid.txt", 100, "text/plain");
		const invalid = createMockFile("bad.png", 100, "image/png");

		let formDataInReject: unknown[] = [];
		let formDataInValueChange: unknown[] = [];

		function SyncForm() {
			const handleReject = useCallback(() => {
				const form = getSlot<HTMLFormElement>(document.body, "sync-form");
				if (form) {
					formDataInReject = new FormData(form).getAll("docs");
				}
			}, []);
			const handleChange = useCallback(() => {
				const form = getSlot<HTMLFormElement>(document.body, "sync-form");
				if (form) {
					formDataInValueChange = new FormData(form).getAll("docs");
				}
			}, []);
			return (
				<form data-slot="sync-form">
					<FileUpload
						accept=".txt"
						defaultValue={[committed]}
						maxFiles={2}
						name="docs"
						onFileReject={handleReject}
						onValueChange={handleChange}
					>
						<FileUploadInput />
					</FileUpload>
				</form>
			);
		}

		const { container, unmount } = mount(<SyncForm />);
		triggerSelect(container, [valid, invalid]);
		expect(formDataInReject).toEqual([committed, valid]);
		expect(formDataInValueChange).toEqual([committed, valid]);
		unmount();
	});

	it("restores committed files on callback exception in onFileReject or onValueChange", () => {
		const committed = createMockFile("c.txt", 100, "text/plain");
		const valid = createMockFile("valid.txt", 100, "text/plain");
		const invalid = createMockFile("bad.png", 100, "image/png");

		const throwFlags: { reject: boolean; valueChange: boolean } = {
			reject: false,
			valueChange: false,
		};

		function FaultyForm() {
			const handleReject = useCallback(() => {
				if (throwFlags.reject) {
					throw new Error("reject explosion");
				}
			}, []);
			const handleChange = useCallback(() => {
				if (throwFlags.valueChange) {
					throw new Error("valueChange explosion");
				}
			}, []);
			return (
				<form data-slot="faulty-form">
					<FileUpload
						accept=".txt"
						defaultValue={[committed]}
						maxFiles={2}
						name="docs"
						onFileReject={handleReject}
						onValueChange={handleChange}
					>
						<FileUploadInput />
					</FileUpload>
				</form>
			);
		}

		const { container, unmount } = mount(<FaultyForm />);
		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		const form = getSlot<HTMLFormElement>(container, "faulty-form");

		throwFlags.reject = true;
		triggerSelect(container, [valid, invalid]);
		expect(Array.from(input?.files ?? [])).toEqual([committed]);
		if (form) {
			expect(new FormData(form).getAll("docs")).toEqual([committed]);
		}

		throwFlags.reject = false;
		throwFlags.valueChange = true;
		triggerSelect(container, [valid]);
		expect(Array.from(input?.files ?? [])).toEqual([committed]);
		if (form) {
			expect(new FormData(form).getAll("docs")).toEqual([committed]);
		}

		unmount();
	});

	it("renders cleanly on the server with SSR-safe markup generation", () => {
		const f = createMockFile("ssr.txt", 100, "text/plain");
		const markup = renderToStaticMarkup(
			<FileUpload defaultValue={[f]} name="ssr-upload">
				<FileUploadDropzone>
					<FileUploadTrigger>Browse</FileUploadTrigger>
				</FileUploadDropzone>
				<FileUploadInput />
			</FileUpload>
		);

		expect(markup).toContain('data-slot="file-upload"');
		expect(markup).toContain('data-slot="file-upload-input"');
		expect(markup).toContain('name="ssr-upload"');
	});
});
