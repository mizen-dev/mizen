// @vitest-environment happy-dom
import type { ComponentProps } from "react";
import { act, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	FileUpload,
	FileUploadItem,
	FileUploadItemStatus,
	FileUploadList,
} from "../../../packages/ui/src/components/file-upload/file-upload";
import { fileUploadStyles } from "../../../packages/ui/src/components/file-upload/file-upload.styles";
import { createMockFile, getSlot, mount } from "./file-upload-test-helpers";

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
function Harness({
	onSetShowFirst,
	onSetShowSecond,
	file,
}: {
	onSetShowFirst: (value: (show: boolean) => void) => void;
	onSetShowSecond: (value: (show: boolean) => void) => void;
	file: File;
}) {
	const [showFirst, setFirst] = useState(true);
	const [showSecond, setSecond] = useState(true);
	onSetShowFirst(setFirst);
	onSetShowSecond(setSecond);
	return (
		<FileUpload defaultValue={[file]}>
			<FileUploadList>
				<FileUploadItem file={file} index={0}>
					{showFirst ? (
						<FileUploadItemStatus status="error">Failed</FileUploadItemStatus>
					) : null}
					{showSecond ? (
						<FileUploadItemStatus status="uploading">
							Uploading
						</FileUploadItemStatus>
					) : null}
				</FileUploadItem>
			</FileUploadList>
		</FileUpload>
	);
}
const ITEM_HOST_STATUS_PATTERN =
	/<li[^>]*data-slot="file-upload-item"[^>]*data-status=/u;
describe("FileUploadItemStatus host presentation and transitions", () => {
	it("does not imperatively assign data-status to the item host and preserves descendant status", () => {
		const file = createMockFile("failed.png", 500, "image/png");
		const { container, unmount } = mount(
			<FileUpload defaultValue={[file]}>
				<FileUploadList>
					<FileUploadItem file={file} index={0}>
						<FileUploadItemStatus status="error">Failed</FileUploadItemStatus>
					</FileUploadItem>
				</FileUploadList>
			</FileUpload>
		);
		const item = getSlot(container, "file-upload-item");
		expect(item?.getAttribute("data-status")).toBeNull();
		const statusSlot = getSlot(container, "file-upload-item-status");
		expect(statusSlot?.getAttribute("data-status")).toBe("error");
		expect(statusSlot?.textContent).toBe("Failed");
		unmount();
	});
	it("supports multiple status children and unmount order without clobbering", () => {
		const file = createMockFile("test.png", 500, "image/png");
		let setShowFirst: (show: boolean) => void = () => undefined;
		let setShowSecond: (show: boolean) => void = () => undefined;
		const onSetShowSecond: ComponentProps<typeof Harness>["onSetShowSecond"] = (
			value
		) => {
			setShowSecond = value;
		};
		const onSetShowFirst: ComponentProps<typeof Harness>["onSetShowFirst"] = (
			value
		) => {
			setShowFirst = value;
		};
		const { container, unmount } = mount(
			<Harness
				file={file}
				onSetShowFirst={onSetShowFirst}
				onSetShowSecond={onSetShowSecond}
			/>
		);
		const item = getSlot(container, "file-upload-item");
		expect(item?.getAttribute("data-status")).toBeNull();
		act(() => setShowFirst(false));
		expect(item?.getAttribute("data-status")).toBeNull();
		const secondStatus = getSlot(container, "file-upload-item-status");
		expect(secondStatus?.getAttribute("data-status")).toBe("uploading");
		expect(secondStatus?.textContent).toBe("Uploading");
		act(() => setShowSecond(false));
		expect(item?.getAttribute("data-status")).toBeNull();
		expect(getSlot(container, "file-upload-item-status")).toBeNull();
		unmount();
	});
	it("renders status state on descendant element in SSR markup before hydration", () => {
		const file = createMockFile("ssr.png", 200, "image/png");
		const markup = renderToStaticMarkup(
			<FileUpload defaultValue={[file]}>
				<FileUploadList>
					<FileUploadItem file={file} index={0}>
						<FileUploadItemStatus status="error">Failed</FileUploadItemStatus>
					</FileUploadItem>
				</FileUploadList>
			</FileUpload>
		);
		expect(markup).toContain('data-slot="file-upload-item-status"');
		expect(markup).toContain('data-status="error"');
		expect(markup).not.toMatch(ITEM_HOST_STATUS_PATTERN);
	});
	it("styles item border via StyleX :has() descendant error status selector", () => {
		const itemBorderColor = fileUploadStyles.item.borderColor;
		expect(itemBorderColor).toHaveProperty(
			":has([data-slot='file-upload-item-status'][data-status='error'])"
		);
	});
});
