import { randomUUID } from "node:crypto";
import { lstat, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { conflict, type FileEdit, unchanged } from "./edit.js";

async function stage(project: string, edit: FileEdit): Promise<string> {
	const path = join(project, edit.path);
	await unchanged(path, edit.before);
	// biome-ignore lint/suspicious/noBitwiseOperators: Preserve the existing POSIX permission bits.
	const mode = edit.before === null ? 0o644 : (await lstat(path)).mode & 0o777;
	const staged = `${path}.mizen-${randomUUID()}.tmp`;
	try {
		await writeFile(staged, edit.after, { flag: "wx", mode });
	} catch (error) {
		await rm(staged, { force: true });
		throw error;
	}
	return staged;
}

export async function restoreFiles(
	project: string,
	edits: FileEdit[]
): Promise<void> {
	for (const edit of edits.toReversed()) {
		// biome-ignore lint/performance/noAwaitInLoops: Rollback preserves commit order and refuses concurrent changes.
		await restoreFile(project, edit);
	}
}

async function restoreFile(project: string, edit: FileEdit): Promise<void> {
	const path = join(project, edit.path);
	const current = await readFile(path, "utf8");
	if (current === edit.before) {
		return;
	}
	if (current !== edit.after) {
		return conflict(
			`Concurrent changes prevent rollback of ${edit.path}. Use the init journal for manual recovery.`
		);
	}
	if (edit.before === null) {
		await rm(path);
		return;
	}
	const temporary = await stage(project, {
		...edit,
		after: edit.before,
		before: edit.after,
	});
	await rename(temporary, path);
}

export async function applyFiles(
	project: string,
	edits: FileEdit[],
	replace = rename
): Promise<void> {
	const staged = new Map<FileEdit, string>();
	const committed: FileEdit[] = [];
	try {
		for (const edit of edits) {
			// biome-ignore lint/performance/noAwaitInLoops: Stage sequentially so every temporary file is tracked for cleanup on failure.
			staged.set(edit, await stage(project, edit));
		}
		for (const edit of edits) {
			// biome-ignore lint/performance/noAwaitInLoops: Revalidate immediately before each ordered atomic replacement.
			await unchanged(join(project, edit.path), edit.before);
			const temporary = staged.get(edit);
			if (!temporary) {
				return conflict("A staged file is missing; inspect the init journal.");
			}
			await replace(temporary, join(project, edit.path));
			committed.push(edit);
		}
	} catch (error) {
		await restoreFiles(project, committed);
		throw error;
	} finally {
		await Promise.all(
			[...staged.values()].map((path) => rm(path, { force: true }))
		);
	}
}
