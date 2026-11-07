import fs from "node:fs/promises";

export async function cleanup(directory) {
	try {
		await fs.rm(directory, {
			force: true,
			maxRetries: 5,
			recursive: true,
			retryDelay: 1000,
		});
	} catch (error) {
		console.warn(`Could not remove temporary directory ${directory}:`, error);
	}
}
