// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	FileUpload,
	FileUploadItem,
	FileUploadItemPreview,
} from "../../../packages/ui/src/components/file-upload/file-upload";
import { createMockFile, mount } from "./file-upload-test-helpers";

vi.mock("@stylexjs/stylex", () => ({
	create: <T extends object>(s: T): T => s,
	defineConsts: <T extends object>(c: T): T => c,
	defineMarker: () => ({}),
	defineVars: <T extends object>(v: T): T => v,
	keyframes: <T extends object>(k: T): T => k,
	props: () => ({}),
	when: { ancestor: () => ":where(*)" },
}));

afterEach(() => vi.restoreAllMocks());

function preview(file: File) {
	return mount(
		<FileUpload defaultValue={[file]}>
			<FileUploadItem file={file} index={0} layout="tile">
				<FileUploadItemPreview>Document</FileUploadItemPreview>
			</FileUploadItem>
		</FileUpload>
	);
}

describe("local file previews", () => {
	it("releases the object URL when the image unmounts", () => {
		const create = vi
			.spyOn(URL, "createObjectURL")
			.mockReturnValue("blob:preview");
		const revoke = vi
			.spyOn(URL, "revokeObjectURL")
			.mockImplementation(() => undefined);
		const file = createMockFile("image.png", 10, "image/png");
		const { container, unmount } = preview(file);
		expect(container.querySelector("img")?.src).toBe("blob:preview");
		expect(create).toHaveBeenCalledWith(file);
		unmount();
		expect(revoke).toHaveBeenCalledWith("blob:preview");
	});

	it("falls back to the document icon and releases a failed image", () => {
		vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:invalid");
		const revoke = vi
			.spyOn(URL, "revokeObjectURL")
			.mockImplementation(() => undefined);
		const { container, unmount } = preview(
			createMockFile("invalid.png", 10, "image/png")
		);
		const image = container.querySelector("img");
		act(() => image?.dispatchEvent(new Event("error")));
		expect(container.querySelector("img")).toBeNull();
		expect(container.textContent).toContain("Document");
		expect(revoke).toHaveBeenCalledWith("blob:invalid");
		unmount();
	});

	it("does not allocate image resources for documents", () => {
		const create = vi.spyOn(URL, "createObjectURL");
		const { container, unmount } = preview(
			createMockFile("notes.txt", 10, "text/plain")
		);
		expect(container.querySelector("img")).toBeNull();
		expect(container.textContent).toContain("Document");
		expect(create).not.toHaveBeenCalled();
		unmount();
	});
});
