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
} from "@mizen-labs/ui";

export function ConfirmDiscard() {
	return (
		<AlertDialog>
			<AlertDialogTrigger
				render={<Button variant="destructive-outline">Discard draft</Button>}
			/>
			<AlertDialogPopup>
				<AlertDialogHeader>
					<AlertDialogTitle>Discard this draft?</AlertDialogTitle>
					<AlertDialogDescription>
						Your unsaved changes will be lost. You can keep editing or discard
						the draft and start again.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogClose
						render={<Button variant="ghost">Keep draft</Button>}
					/>
					<AlertDialogClose
						render={<Button variant="destructive">Discard</Button>}
					/>
				</AlertDialogFooter>
			</AlertDialogPopup>
		</AlertDialog>
	);
}
