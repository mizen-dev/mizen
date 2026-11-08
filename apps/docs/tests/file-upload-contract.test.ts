import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vite-plus/test";
import type {
	FileUploadChangeDetails,
	FileUploadDropzoneProps,
	FileUploadInputProps,
	FileUploadItemNameProps,
	FileUploadItemProgressProps,
	FileUploadItemProps,
	FileUploadItemRemoveProps,
	FileUploadItemSizeProps,
	FileUploadItemStatusProps,
	FileUploadListProps,
	FileUploadProps,
	FileUploadStatus,
	FileUploadTriggerProps,
} from "../../../packages/ui/src/components/file-upload/file-upload";
import type {
	FileRejection,
	FileRejectionCode,
} from "../../../packages/ui/src/components/file-upload/file-upload-validation";
import { getComponentDoc } from "../src/entities/documentation/model/docs-registry";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	createTheme: <T extends object>(_variables: T, overrides: object): object =>
		overrides,
	defaultMarker: () => ({}),
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: (selector: string) => selector },
}));

type Accepts<T, K extends PropertyKey> = K extends keyof T ? true : false;
type RejectsAll<T, K extends PropertyKey> = [Extract<keyof T, K>] extends [
	never,
]
	? true
	: false;
type IsExact<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;
type IsRequired<T, K extends PropertyKey> = K extends keyof T
	? Record<string, never> extends Pick<T, K>
		? false
		: true
	: false;

type Omitted = "className" | "data-slot" | "style";
type ProtectedInput =
	| "accept"
	| "defaultValue"
	| "disabled"
	| "multiple"
	| "name"
	| "onChange"
	| "required"
	| "type"
	| "value";

type TestPickerDetails = Extract<FileUploadChangeDetails, { reason: "picker" }>;
type TestDropDetails = Extract<FileUploadChangeDetails, { reason: "drop" }>;
type TestRemoveDetails = Extract<FileUploadChangeDetails, { reason: "remove" }>;

type ClosedContract = [
	RejectsAll<FileUploadProps, Omitted>,
	RejectsAll<FileUploadProps, "multiple" | "required">,
	Accepts<FileUploadProps, "accept">,
	Accepts<FileUploadProps, "children">,
	Accepts<FileUploadProps, "defaultValue">,
	Accepts<FileUploadProps, "disabled">,
	Accepts<FileUploadProps, "maxFiles">,
	Accepts<FileUploadProps, "maxSize">,
	Accepts<FileUploadProps, "name">,
	Accepts<FileUploadProps, "onFileReject">,
	Accepts<FileUploadProps, "onValueChange">,
	Accepts<FileUploadProps, "ref">,
	Accepts<FileUploadProps, "value">,
	RejectsAll<FileUploadDropzoneProps, Omitted>,
	Accepts<FileUploadDropzoneProps, "children">,
	Accepts<FileUploadDropzoneProps, "disabled">,
	Accepts<FileUploadDropzoneProps, "ref">,
	RejectsAll<FileUploadTriggerProps, Omitted>,
	Accepts<FileUploadTriggerProps, "children">,
	Accepts<FileUploadTriggerProps, "disabled">,
	Accepts<FileUploadTriggerProps, "ref">,
	RejectsAll<FileUploadInputProps, Omitted>,
	RejectsAll<FileUploadInputProps, ProtectedInput>,
	RejectsAll<FileUploadInputProps, "children">,
	Accepts<FileUploadInputProps, "ref">,
	RejectsAll<FileUploadListProps, Omitted>,
	Accepts<FileUploadListProps, "children">,
	Accepts<FileUploadListProps, "ref">,
	RejectsAll<FileUploadItemProps, Omitted>,
	Accepts<FileUploadItemProps, "children">,
	Accepts<FileUploadItemProps, "file">,
	Accepts<FileUploadItemProps, "index">,
	IsRequired<FileUploadItemProps, "file">,
	IsRequired<FileUploadItemProps, "index">,
	Accepts<FileUploadItemProps, "ref">,
	RejectsAll<FileUploadItemNameProps, Omitted>,
	Accepts<FileUploadItemNameProps, "children">,
	Accepts<FileUploadItemNameProps, "ref">,
	RejectsAll<FileUploadItemSizeProps, Omitted>,
	Accepts<FileUploadItemSizeProps, "children">,
	Accepts<FileUploadItemSizeProps, "ref">,
	RejectsAll<FileUploadItemStatusProps, Omitted>,
	Accepts<FileUploadItemStatusProps, "children">,
	Accepts<FileUploadItemStatusProps, "ref">,
	Accepts<FileUploadItemStatusProps, "status">,
	RejectsAll<FileUploadItemProgressProps, Omitted>,
	RejectsAll<FileUploadItemProgressProps, "children">,
	Accepts<FileUploadItemProgressProps, "ref">,
	Accepts<FileUploadItemProgressProps, "value">,
	RejectsAll<FileUploadItemRemoveProps, Omitted>,
	Accepts<FileUploadItemRemoveProps, "children">,
	Accepts<FileUploadItemRemoveProps, "disabled">,
	Accepts<FileUploadItemRemoveProps, "ref">,
	IsExact<FileUploadStatus, "error" | "pending" | "success" | "uploading">,
	IsExact<
		FileRejectionCode,
		"file-invalid-type" | "file-too-large" | "too-many-files"
	>,
	Accepts<TestPickerDetails, "accepted">,
	Accepts<TestPickerDetails, "cancel">,
	Accepts<TestPickerDetails, "isCanceled">,
	Accepts<TestPickerDetails, "rejected">,
	Accepts<TestDropDetails, "accepted">,
	Accepts<TestDropDetails, "cancel">,
	Accepts<TestDropDetails, "isCanceled">,
	Accepts<TestDropDetails, "rejected">,
	Accepts<TestRemoveDetails, "cancel">,
	Accepts<TestRemoveDetails, "file">,
	Accepts<TestRemoveDetails, "index">,
	Accepts<TestRemoveDetails, "isCanceled">,
	Accepts<FileRejection, "code">,
	Accepts<FileRejection, "file">,
];

type AllTrue<T extends readonly boolean[]> = T[number] extends true
	? true
	: false;

const isContractValid: AllTrue<ClosedContract> = true;

describe("FileUpload contract and export manifest", () => {
	it("exports exact runtime members matching the 12 public components", async () => {
		const mod = await import(
			"../../../packages/ui/src/components/file-upload/file-upload"
		);

		expect(Object.keys(mod).sort()).toEqual([
			"FileUpload",
			"FileUploadDropzone",
			"FileUploadInput",
			"FileUploadItem",
			"FileUploadItemName",
			"FileUploadItemPreview",
			"FileUploadItemProgress",
			"FileUploadItemRemove",
			"FileUploadItemSize",
			"FileUploadItemStatus",
			"FileUploadList",
			"FileUploadTrigger",
		]);

		expect(isContractValid).toBe(true);
	});

	it("declares typed subpath in packages/ui/package.json", () => {
		const pkgPath = resolve(
			import.meta.dirname,
			"../../../packages/ui/package.json"
		);
		const pkg: unknown = JSON.parse(readFileSync(pkgPath, "utf8"));
		const fileUploadExport =
			typeof pkg === "object" &&
			pkg !== null &&
			"exports" in pkg &&
			typeof pkg.exports === "object" &&
			pkg.exports !== null &&
			"./file-upload" in pkg.exports
				? pkg.exports["./file-upload"]
				: undefined;

		expect(fileUploadExport).toEqual({
			default: "./dist/components/file-upload/file-upload.js",
			source: "./src/components/file-upload/file-upload.tsx",
			types: "./dist/components/file-upload/file-upload.d.ts",
		});
	});

	it("exports FileUpload components from root packages/ui", async () => {
		const rootMod = await import("../../../packages/ui/src");
		const mod = await import(
			"../../../packages/ui/src/components/file-upload/file-upload"
		);

		expect(rootMod.FileUpload).toBe(mod.FileUpload);
		expect(rootMod.FileUploadDropzone).toBe(mod.FileUploadDropzone);
		expect(rootMod.FileUploadTrigger).toBe(mod.FileUploadTrigger);
		expect(rootMod.FileUploadInput).toBe(mod.FileUploadInput);
		expect(rootMod.FileUploadList).toBe(mod.FileUploadList);
		expect(rootMod.FileUploadItem).toBe(mod.FileUploadItem);
		expect(rootMod.FileUploadItemName).toBe(mod.FileUploadItemName);
		expect(rootMod.FileUploadItemSize).toBe(mod.FileUploadItemSize);
		expect(rootMod.FileUploadItemStatus).toBe(mod.FileUploadItemStatus);
		expect(rootMod.FileUploadItemProgress).toBe(mod.FileUploadItemProgress);
		expect(rootMod.FileUploadItemRemove).toBe(mod.FileUploadItemRemove);
	});

	it("verifies FileUploadInputProps and FileUploadItemProgressProps reject children prop", () => {
		const isInputChildrenRejected: RejectsAll<
			FileUploadInputProps,
			"children"
		> = true;
		const isProgressChildrenRejected: RejectsAll<
			FileUploadItemProgressProps,
			"children"
		> = true;

		expect(isInputChildrenRejected).toBe(true);
		expect(isProgressChildrenRejected).toBe(true);
	});

	it("publishes accurate FileUpload API metadata in docs registry", () => {
		const doc = getComponentDoc("file-upload");
		expect(doc).toBeDefined();

		const api = Object.fromEntries(
			doc?.api.map((item) => [item.name, item]) ?? []
		);

		expect(api.onValueChange?.type).toBe(
			"(files: readonly File[], details: FileUploadChangeDetails) => void"
		);
		expect(api.onFileReject?.type).toBe(
			"(rejections: readonly FileRejection[]) => void"
		);
	});
});
