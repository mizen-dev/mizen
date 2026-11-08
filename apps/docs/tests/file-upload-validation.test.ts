import { describe, expect, it, vi } from "vite-plus/test";
import {
	formatFileSize,
	validateFiles,
} from "../../../packages/ui/src/components/file-upload/file-upload-validation";
import { createMockFile } from "./file-upload-test-helpers";

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

describe("FileUpload validation rules and size formatting", () => {
	it("validates exact and wildcard MIME types", () => {
		const png = createMockFile("image.png", 500, "image/png");
		const jpeg = createMockFile("photo.jpeg", 500, "image/jpeg");
		const pdf = createMockFile("doc.pdf", 500, "application/pdf");

		const exactResult = validateFiles([png, jpeg], { accept: "image/png" });
		expect(exactResult.accepted).toEqual([png]);
		expect(exactResult.rejected).toEqual([
			{ code: "file-invalid-type", file: jpeg },
		]);

		const wildcardResult = validateFiles([png, jpeg, pdf], {
			accept: "image/*",
		});
		expect(wildcardResult.accepted).toEqual([png, jpeg]);
		expect(wildcardResult.rejected).toEqual([
			{ code: "file-invalid-type", file: pdf },
		]);
	});

	it("validates extensions case-insensitively and handles empty MIME types", () => {
		const upperPng = createMockFile("PHOTO.PNG", 500, "image/png");
		const mixedPdf = createMockFile("Contract.Pdf", 500, "application/pdf");
		const noMimeCsv = createMockFile("data.CSV", 500, "");
		const noMimeTxt = createMockFile("notes.txt", 500, "");

		const extResult = validateFiles([upperPng, mixedPdf], {
			accept: ".png,.pdf",
		});
		expect(extResult.accepted).toEqual([upperPng, mixedPdf]);
		expect(extResult.rejected).toHaveLength(0);

		const emptyMimeResult = validateFiles([noMimeCsv, noMimeTxt], {
			accept: ".csv",
		});
		expect(emptyMimeResult.accepted).toEqual([noMimeCsv]);
		expect(emptyMimeResult.rejected).toEqual([
			{ code: "file-invalid-type", file: noMimeTxt },
		]);
	});

	it("rejects files exceeding maxSize with file-too-large", () => {
		const smallFile = createMockFile("small.pdf", 1024, "application/pdf");
		const largeFile = createMockFile("large.pdf", 2048, "application/pdf");

		const result = validateFiles([smallFile, largeFile], { maxSize: 1024 });
		expect(result.accepted).toEqual([smallFile]);
		expect(result.rejected).toEqual([
			{ code: "file-too-large", file: largeFile },
		]);
	});

	it("enforces cumulative maxFiles and isolates partial acceptance", () => {
		const existing1 = createMockFile("f1.txt", 100, "text/plain");
		const existing2 = createMockFile("f2.txt", 100, "text/plain");
		const incoming1 = createMockFile("f3.txt", 100, "text/plain");
		const incoming2 = createMockFile("f4.txt", 100, "text/plain");

		const result = validateFiles([incoming1, incoming2], {
			currentFiles: [existing1, existing2],
			maxFiles: 3,
		});

		expect(result.accepted).toEqual([incoming1]);
		expect(result.rejected).toEqual([
			{ code: "too-many-files", file: incoming2 },
		]);
	});

	it("allows single-file replacement when maxFiles is 1", () => {
		const oldFile = createMockFile("old.png", 500, "image/png");
		const newFile = createMockFile("new.png", 500, "image/png");

		const result = validateFiles([newFile], {
			currentFiles: [oldFile],
			maxFiles: 1,
		});

		expect(result.accepted).toEqual([newFile]);
		expect(result.rejected).toHaveLength(0);
	});

	it("preserves selection order and permits duplicates", () => {
		const fileA = createMockFile("duplicate.pdf", 300, "application/pdf");
		const fileB = createMockFile("unique.pdf", 300, "application/pdf");

		const result = validateFiles([fileA, fileB, fileA], {
			maxFiles: 5,
		});

		expect(result.accepted).toEqual([fileA, fileB, fileA]);
		expect(result.rejected).toHaveLength(0);
	});

	it("partitions multiple validation failures with correct codes", () => {
		const valid = createMockFile("valid.png", 500, "image/png");
		const tooBig = createMockFile("large.png", 5000, "image/png");
		const wrongType = createMockFile(
			"doc.exe",
			500,
			"application/x-msdownload"
		);

		const result = validateFiles([valid, tooBig, wrongType], {
			accept: "image/*",
			maxSize: 1000,
		});

		expect(result.accepted).toEqual([valid]);
		expect(result.rejected).toEqual([
			{ code: "file-too-large", file: tooBig },
			{ code: "file-invalid-type", file: wrongType },
		]);
	});

	it("formats byte values cleanly in B, KB, and MB", () => {
		expect(formatFileSize(0)).toBe("0 B");
		expect(formatFileSize(512)).toBe("512 B");
		expect(formatFileSize(1024)).toBe("1 KB");
		expect(formatFileSize(1536)).toBe("1.5 KB");
		expect(formatFileSize(1_048_576)).toBe("1 MB");
		expect(formatFileSize(2_621_440)).toBe("2.5 MB");
	});

	it("fails closed with zero capacity on invalid or zero maxFiles (NaN, infinity, fraction, negative)", () => {
		const f1 = createMockFile("one.txt", 100, "text/plain");
		const f2 = createMockFile("two.txt", 100, "text/plain");

		for (const invalidMaxFiles of [
			0,
			-1,
			1.5,
			Number.NaN,
			Number.POSITIVE_INFINITY,
		]) {
			const result = validateFiles([f1, f2], { maxFiles: invalidMaxFiles });
			expect(result.accepted).toHaveLength(0);
			expect(result.rejected).toEqual([
				{ code: "too-many-files", file: f1 },
				{ code: "too-many-files", file: f2 },
			]);
		}

		const omittedResult = validateFiles([f1, f2], { maxFiles: undefined });
		expect(omittedResult.accepted).toEqual([f1, f2]);
		expect(omittedResult.rejected).toHaveLength(0);
	});

	it("accepts zero-byte file and rejects positive-byte files when maxSize is 0", () => {
		const zeroByteFile = createMockFile("empty.txt", 0, "text/plain");
		const normalFile = createMockFile("normal.txt", 100, "text/plain");

		const result = validateFiles([zeroByteFile, normalFile], { maxSize: 0 });
		expect(result.accepted).toEqual([zeroByteFile]);
		expect(result.rejected).toEqual([
			{ code: "file-too-large", file: normalFile },
		]);
	});

	it("rejects all files including zero-byte files when defined maxSize is invalid", () => {
		const zeroByteFile = createMockFile("empty.txt", 0, "text/plain");
		const normalFile = createMockFile("normal.txt", 100, "text/plain");

		const invalidMaxSizes = [
			Number.NaN,
			Number.POSITIVE_INFINITY,
			Number.NEGATIVE_INFINITY,
			-1,
			1.5,
			Number.MAX_SAFE_INTEGER + 1,
		];

		for (const invalidMaxSize of invalidMaxSizes) {
			const result = validateFiles([zeroByteFile, normalFile], {
				maxSize: invalidMaxSize,
			});
			expect(result.accepted).toHaveLength(0);
			expect(result.rejected).toEqual([
				{ code: "file-too-large", file: zeroByteFile },
				{ code: "file-too-large", file: normalFile },
			]);
		}
	});

	it("permits both zero-byte and positive-byte files when maxSize is omitted", () => {
		const zeroByteFile = createMockFile("empty.txt", 0, "text/plain");
		const normalFile = createMockFile("normal.txt", 100, "text/plain");

		const result = validateFiles([zeroByteFile, normalFile], {
			maxSize: undefined,
		});
		expect(result.accepted).toEqual([zeroByteFile, normalFile]);
		expect(result.rejected).toHaveLength(0);
	});
});
