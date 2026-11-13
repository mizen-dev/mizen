"use client";
import { Button, Group, Stack } from "@mizen-labs/ui";
import { anchoredToastManager, toastManager } from "@mizen-labs/ui/toast";
import type { MouseEvent } from "react";
import { useCallback, useRef } from "react";

const CONNECTION_ID = "workspace-connection-lost";
const DEPLOY_ID = "workspace-release-deploy";
const FAILURE_ID = "workspace-build-failure";
const MANIFEST_ID = "workspace-manifest-verify";
const SYNC_ID = "workspace-release-sync";
function handleSuccessWithAction() {
	toastManager.add({
		actionProps: {
			children: "Undo",
			onClick: () => {
				toastManager.update(DEPLOY_ID, {
					actionProps: undefined,
					description: "Restored previous release deployment v2.4.1.",
					title: "Deployment rolled back",
					type: "info",
				});
			},
		},
		description: "Production release packages deployed successfully.",
		id: DEPLOY_ID,
		title: "Release deployed",
		type: "success",
	});
}
function handleStartSync() {
	toastManager.add({
		description: "Compiling workspace assets and verification hashes.",
		id: SYNC_ID,
		title: "Syncing release packages",
		type: "loading",
	});
}
function handleCompleteSync() {
	toastManager.add({
		description: "Verification hashes confirmed across all targets.",
		id: SYNC_ID,
		title: "Release packages synced",
		type: "success",
	});
}
function handleBuildFailure() {
	toastManager.add({
		actionProps: {
			children: "Retry",
			onClick: () => {
				toastManager.update(FAILURE_ID, {
					actionProps: undefined,
					description: "Re-verifying package checksums with origin registry.",
					title: "Retrying verification",
					type: "info",
				});
			},
		},
		description: "Checksum mismatch detected on target registry.",
		id: FAILURE_ID,
		priority: "high",
		title: "Release build failed",
		type: "error",
	});
}
function handleLostConnection() {
	toastManager.add({
		actionProps: {
			children: "Dismiss",
			onClick: () => toastManager.close(CONNECTION_ID),
		},
		id: CONNECTION_ID,
		title: "Connection lost",
		type: "warning",
	});
}
const STACK_NOTICES = [
	{
		description: "Turbopack re-used cached build artifacts.",
		title: "Build cache warmed",
		type: "info",
	},
	{
		description: "Main branch has 4 new commits ready to pull.",
		title: "Branch behind origin",
		type: "warning",
	},
	{
		description:
			"Audited dependencies across all workspaces with zero high-severity flags.",
		title: "Security scan passed",
		type: "success",
	},
] as const;
function handleStandardAnchored(event: MouseEvent<HTMLButtonElement>) {
	anchoredToastManager.add({
		actionProps: {
			children: "Dismiss",
			onClick: () => anchoredToastManager.close(MANIFEST_ID),
		},
		description: "Release manifest signed with production key.",
		id: MANIFEST_ID,
		positionerProps: {
			anchor: event.currentTarget,
			side: "top",
			sideOffset: 8,
		},
		title: "Manifest verified",
		type: "info",
	});
}
function handleTooltipAnchored(event: MouseEvent<HTMLButtonElement>) {
	anchoredToastManager.add({
		data: { tooltipStyle: true },
		positionerProps: {
			anchor: event.currentTarget,
			side: "top",
			sideOffset: 6,
		},
		title: "Commit SHA copied to clipboard",
		type: "success",
	});
}
export function ToastInContextExample1() {
	const stackNoticeIndexRef = useRef(0);
	const handleAddStackNotice = useCallback(() => {
		const notice =
			STACK_NOTICES[stackNoticeIndexRef.current % STACK_NOTICES.length];
		stackNoticeIndexRef.current += 1;
		if (!notice) {
			return;
		}
		toastManager.add({
			description: notice.description,
			title: notice.title,
			type: notice.type,
		});
	}, []);
	return (
		<Stack gap="4">
			<Group>
				<Button onClick={handleSuccessWithAction} variant="outline">
					Deploy production release
				</Button>
				<Button onClick={handleStartSync} variant="outline">
					Start package sync
				</Button>
				<Button onClick={handleCompleteSync} variant="outline">
					Complete package sync
				</Button>
				<Button onClick={handleBuildFailure} variant="outline">
					Trigger build failure
				</Button>
				<Button onClick={handleAddStackNotice} variant="outline">
					Add stack notice
				</Button>
				<Button onClick={handleLostConnection} variant="outline">
					Report lost connection
				</Button>
			</Group>
			<Group>
				<Button onClick={handleStandardAnchored} variant="outline">
					Show manifest details
				</Button>
				<Button onClick={handleTooltipAnchored} variant="outline">
					Copy release commit SHA
				</Button>
			</Group>
		</Stack>
	);
}
