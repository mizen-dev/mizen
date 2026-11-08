// @vitest-environment happy-dom
import type { ComponentProps } from "react";
import { act, useCallback, useState } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadInput,
} from "../../../packages/ui/src/components/file-upload/file-upload";
import { useForm } from "../../../packages/ui/src/form";
import {
	createMockFile,
	getSlot,
	mount,
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
	when: {
		ancestor: () => ":where(*)",
	},
}));
describe("FileUpload form reset, controlled synchronization, and TanStack integration", () => {
	it("synchronizes controlled external replacement through React 19 callback ref", () => {
		const f1 = createMockFile("initial.txt", 100, "text/plain");
		const f2 = createMockFile("replaced.txt", 200, "text/plain");
		const { container, unmount } = mount(<ControlledForm f1={f1} f2={f2} />);
		const form = getSlot<HTMLFormElement>(container, "controlled-form");
		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		const btn = getSlot<HTMLButtonElement>(container, "replace-btn");
		expect(Array.from(input?.files ?? [])).toEqual([f1]);
		if (btn) {
			act(() => btn.click());
		}
		expect(Array.from(input?.files ?? [])).toEqual([f2]);
		if (form) {
			expect(new FormData(form).getAll("docs")).toEqual([f2]);
		}
		unmount();
	});
	it("handles form reset for uncontrolled defaultValue and controlled state", async () => {
		const f1 = createMockFile("default.txt", 100, "text/plain");
		const f2 = createMockFile("new.txt", 100, "text/plain");
		const { container, unmount } = mount(
			<form data-slot="reset-form">
				<FileUpload defaultValue={[f1]} name="files">
					<FileUploadInput />
				</FileUpload>
			</form>
		);
		const form = getSlot<HTMLFormElement>(container, "reset-form");
		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		triggerSelect(container, [f2]);
		expect(Array.from(input?.files ?? [])).toEqual([f2]);
		await act(async () => {
			form?.reset();
			await Promise.resolve();
		});
		expect(Array.from(input?.files ?? [])).toEqual([f1]);
		unmount();
		const onValueChange = vi.fn();
		const controlledMount = mount(
			<ControlledResetForm f1={f1} onValueChange={onValueChange} />
		);
		const ctrlForm = getSlot<HTMLFormElement>(
			controlledMount.container,
			"controlled-reset-form"
		);
		const ctrlInput = getSlot<HTMLInputElement>(
			controlledMount.container,
			"file-upload-input"
		);
		triggerSelect(controlledMount.container, [f2]);
		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(onValueChange).toHaveBeenCalledWith(
			[f2],
			expect.objectContaining({
				reason: "picker",
			})
		);
		expect(Array.from(ctrlInput?.files ?? [])).toEqual([f1]);
		onValueChange.mockClear();
		await act(async () => {
			ctrlForm?.reset();
			await Promise.resolve();
		});
		expect(Array.from(ctrlInput?.files ?? [])).toEqual([f1]);
		expect(onValueChange).toHaveBeenCalledTimes(0);
		controlledMount.unmount();
	});
	it("preserves files when native form reset is canceled via preventDefault", async () => {
		const f1 = createMockFile("default.txt", 100, "text/plain");
		const f2 = createMockFile("new.txt", 100, "text/plain");
		const { container, unmount } = mount(
			<form data-slot="canceled-reset-form">
				<FileUpload defaultValue={[f1]} name="files">
					<FileUploadInput />
				</FileUpload>
			</form>
		);
		const form = getSlot<HTMLFormElement>(container, "canceled-reset-form");
		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		form?.addEventListener("reset", (event) => {
			event.preventDefault();
		});
		triggerSelect(container, [f2]);
		expect(Array.from(input?.files ?? [])).toEqual([f2]);
		act(() => {
			form?.dispatchEvent(
				new Event("reset", {
					bubbles: true,
					cancelable: true,
				})
			);
		});
		await act(async () => {
			await Promise.resolve();
		});
		expect(Array.from(input?.files ?? [])).toEqual([f2]);
		unmount();
	});
	it("integrates explicitly with TanStack Form via value, name, onValueChange, and onBlur", () => {
		const doc = createMockFile("plan.pdf", 500, "application/pdf");
		const { container, unmount } = mount(<TanStackIntegrationForm />);
		expect(getSlot(container, "is-blurred")?.textContent).toBe("false");
		triggerSelect(container, [doc]);
		expect(getSlot(container, "is-blurred")?.textContent).toBe("false");
		const input = getSlot<HTMLInputElement>(container, "file-upload-input");
		const outsideBtn = getSlot<HTMLButtonElement>(container, "outside-btn");
		const root = getSlot<HTMLDivElement>(container, "file-upload");
		expect(Array.from(input?.files ?? [])).toEqual([doc]);
		act(() => {
			root?.focus();
			outsideBtn?.focus();
		});
		expect(getSlot(container, "is-blurred")?.textContent).toBe("true");
		unmount();
	});
});
function ControlledForm({ f1, f2 }: { f1: File; f2: File }) {
	const [files, setFiles] = useState([f1]);
	const handleReplace = useCallback(() => setFiles([f2]), [f2]);
	return (
		<form data-slot="controlled-form">
			<button data-slot="replace-btn" onClick={handleReplace} type="button">
				Replace
			</button>
			<FileUpload name="docs" value={files}>
				<FileUploadInput />
			</FileUpload>
		</form>
	);
}
function ControlledResetForm({
	f1,
	onValueChange,
}: {
	f1: File;
	onValueChange: NonNullable<
		ComponentProps<typeof FileUpload>["onValueChange"]
	>;
}) {
	const [controlledFiles] = useState([f1]);
	return (
		<form data-slot="controlled-reset-form">
			<FileUpload
				name="controlled-files"
				onValueChange={onValueChange}
				value={controlledFiles}
			>
				<FileUploadInput />
			</FileUpload>
		</form>
	);
}
function AttachmentField({
	field,
}: {
	field: {
		handleBlur: () => void;
		handleChange: (updater: File[]) => void;
		name: string;
		state: {
			meta: {
				isBlurred: boolean;
			};
			value: File[];
		};
	};
}) {
	const handleValueChange = useCallback(
		(nextFiles: readonly File[]) => {
			field.handleChange([...nextFiles]);
		},
		[field]
	);
	return (
		<div>
			<span data-slot="is-blurred">{String(field.state.meta.isBlurred)}</span>
			<FileUpload
				name={field.name}
				onBlur={field.handleBlur}
				onValueChange={handleValueChange}
				value={field.state.value}
			>
				<FileUploadInput />
				<FileUploadDropzone />
			</FileUpload>
		</div>
	);
}
function TanStackIntegrationForm() {
	const form = useForm({
		defaultValues: {
			attachments: [] as File[],
		},
	});
	return (
		<form>
			<form.Field name="attachments">
				{(field) => <AttachmentField field={field} />}
			</form.Field>
			<button data-slot="outside-btn" type="button">
				Outside
			</button>
		</form>
	);
}
