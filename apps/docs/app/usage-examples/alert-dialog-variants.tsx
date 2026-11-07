"use client";
import {
	AlertDialog,
	AlertDialogClose,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogPopup,
	AlertDialogTitle,
	AlertDialogTrigger,
	Button,
	Stack,
} from "@mizen/ui";
import { useCallback, useState } from "react";

export function AlertDialogProjectArchiveExample1() {
	const [status, setStatus] = useState<string | null>(null);
	const handleCancel = useCallback(() => {
		setStatus(null);
	}, []);
	const handleConfirm = useCallback(() => {
		setStatus("Project deleted.");
	}, []);
	return (
		<Stack gap="4">
			<div>
				<AlertDialog>
					<AlertDialogTrigger
						render={
							<Button variant="destructive">Delete project permanently</Button>
						}
					/>
					<AlertDialogPopup>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete project?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogClose
								onClick={handleCancel}
								render={<Button variant="outline">Cancel</Button>}
							/>
							<AlertDialogClose
								onClick={handleConfirm}
								render={<Button variant="destructive">Delete project</Button>}
							/>
						</AlertDialogFooter>
					</AlertDialogPopup>
				</AlertDialog>
				{status ? <p role="status">{status}</p> : null}
			</div>
		</Stack>
	);
}
