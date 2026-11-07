"use client";

import { Button, Group } from "@mizen/ui";
import { toastManager } from "@mizen/ui/toast";
import type { MouseEvent } from "react";

const statuses: Record<
	string,
	{ title: string; description: string; type: string }
> = {
	error: {
		description: "Check your connection and try again.",
		title: "Could not save changes",
		type: "error",
	},
	info: {
		description: "Refresh when you are ready to update.",
		title: "New version available",
		type: "info",
	},
	success: {
		description: "Your workspace settings are up to date.",
		title: "Changes saved",
		type: "success",
	},
	warning: {
		description: "Save your work before signing in again.",
		title: "Session expires soon",
		type: "warning",
	},
};

function showStatus(event: MouseEvent<HTMLButtonElement>) {
	const notice = statuses[event.currentTarget.value];
	if (notice) {
		toastManager.add(notice);
	}
}

export function ToastWithStatus() {
	return (
		<Group>
			{["success", "error", "info", "warning"].map((type) => (
				<Button key={type} onClick={showStatus} value={type} variant="outline">
					{type.charAt(0).toUpperCase() + type.slice(1)} toast
				</Button>
			))}
		</Group>
	);
}

function showStack() {
	[
		"Short message.",
		"A longer message that wraps onto another line.",
		"This notice has more detail so you can compare card heights when the stack expands.",
	].forEach((description, index) => {
		toastManager.add({
			description,
			id: `toast-stack-example-${index}`,
			timeout: 10_000,
			title: `Notice ${index + 1}`,
		});
	});
}

export function ToastVaryingHeights() {
	return (
		<Button onClick={showStack} variant="outline">
			Show toast stack
		</Button>
	);
}

function runPromise(event: MouseEvent<HTMLButtonElement>) {
	const success = event.currentTarget.value === "success";
	const promise = new Promise<string>((resolve, reject) => {
		setTimeout(
			() =>
				success
					? resolve("Workspace export is ready.")
					: reject(new Error("The export could not finish.")),
			1500
		);
	});
	return toastManager
		.promise(promise, {
			error: (error) => ({
				description: error.message,
				title: "Export failed",
			}),
			loading: {
				description: "Collecting workspace files.",
				title: "Preparing export",
			},
			success: (description) => ({ description, title: "Export complete" }),
		})
		.catch(() => undefined);
}

export function ToastPromise() {
	return (
		<Group>
			<Button onClick={runPromise} value="success" variant="outline">
				Complete export
			</Button>
			<Button onClick={runPromise} value="error" variant="outline">
				Fail export
			</Button>
		</Group>
	);
}
