export type FileRejectionCode =
	| "file-invalid-type"
	| "file-too-large"
	| "too-many-files";

export interface FileRejection {
	readonly code: FileRejectionCode;
	readonly file: File;
}

export interface ValidationOptions {
	accept?: string;
	currentFiles?: readonly File[];
	maxFiles?: number;
	maxSize?: number;
}

export interface ValidationResult {
	accepted: File[];
	rejected: FileRejection[];
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) {
		return `${bytes} B`;
	}
	const kb = 1024;
	const mb = kb * 1024;
	if (bytes < mb) {
		return `${Number((bytes / kb).toFixed(1))} KB`;
	}
	return `${Number((bytes / mb).toFixed(1))} MB`;
}

function matchesPattern(name: string, type: string, pattern: string): boolean {
	if (pattern.startsWith(".")) {
		return name.endsWith(pattern);
	}
	if (pattern.endsWith("/*")) {
		return type.startsWith(pattern.slice(0, -1));
	}
	return type === pattern;
}

function matchesAccept(file: File, accept: string): boolean {
	const patterns = accept
		.split(",")
		.map((pattern) => pattern.trim().toLowerCase())
		.filter((pattern) => pattern.length > 0);

	if (patterns.length === 0) {
		return true;
	}

	const name = file.name.toLowerCase();
	const type = file.type.toLowerCase();
	return patterns.some((pattern) => matchesPattern(name, type, pattern));
}

function computeAvailableSlots(maxFiles?: number, currentCount = 0): number {
	if (maxFiles === undefined) {
		return Number.POSITIVE_INFINITY;
	}
	if (!Number.isSafeInteger(maxFiles) || maxFiles <= 0) {
		return 0;
	}
	if (maxFiles === 1) {
		return 1;
	}
	return Math.max(0, maxFiles - currentCount);
}

type EffectiveMaxSize =
	| { readonly kind: "invalid" }
	| { readonly kind: "unlimited" }
	| { readonly kind: "valid"; readonly limit: number };

function checkFileRejection(
	file: File,
	accept?: string,
	maxSize: EffectiveMaxSize = { kind: "unlimited" },
	availableSlots = Number.POSITIVE_INFINITY
): FileRejectionCode | null {
	if (accept && !matchesAccept(file, accept)) {
		return "file-invalid-type";
	}
	if (
		maxSize.kind === "invalid" ||
		(maxSize.kind === "valid" && file.size > maxSize.limit)
	) {
		return "file-too-large";
	}
	if (availableSlots <= 0) {
		return "too-many-files";
	}
	return null;
}

function computeEffectiveMaxSize(maxSize?: number): EffectiveMaxSize {
	if (maxSize === undefined) {
		return { kind: "unlimited" };
	}
	if (!Number.isSafeInteger(maxSize) || maxSize < 0) {
		return { kind: "invalid" };
	}
	return { kind: "valid", limit: maxSize };
}

export function validateFiles(
	files: readonly File[],
	options: ValidationOptions = {}
): ValidationResult {
	const { accept, currentFiles = [], maxFiles, maxSize } = options;
	const effectiveMaxSize = computeEffectiveMaxSize(maxSize);
	const accepted: File[] = [];
	const rejected: FileRejection[] = [];
	let availableSlots = computeAvailableSlots(maxFiles, currentFiles.length);

	for (const file of files) {
		const rejection = checkFileRejection(
			file,
			accept,
			effectiveMaxSize,
			availableSlots
		);
		if (rejection) {
			rejected.push({ code: rejection, file });
		} else {
			accepted.push(file);
			availableSlots -= 1;
		}
	}

	return { accepted, rejected };
}

export function cloneRejections(
	rejections: readonly FileRejection[]
): FileRejection[] {
	return rejections.map((r) => ({ code: r.code, file: r.file }));
}
