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
} from "@mizen/ui";
import { props } from "@stylexjs/stylex";
import { useCallback, useState } from "react";
import { specimenStyles as previewStyles } from "./specimen.styles";
import { SpecimenSection } from "./specimen-section";

export function AlertDialogSpecimen() {
	const [status, setStatus] = useState<string | null>(null);

	const handleCancel = useCallback(() => {
		setStatus(null);
	}, []);

	const handleConfirm = useCallback(() => {
		setStatus("Project deleted.");
	}, []);

	return (
		<div {...props(previewStyles.examples)}>
			<SpecimenSection
				description="Remove a project only after reviewing the confirmation."
				primary
				title="Project archive"
			>
				<div>
					<AlertDialog>
						<AlertDialogTrigger
							render={
								<Button variant="destructive">
									Delete project permanently
								</Button>
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
			</SpecimenSection>
		</div>
	);
}
