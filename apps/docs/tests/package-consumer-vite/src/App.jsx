// biome-ignore-all lint/style/useFilenamingConvention: Match the default create-vite React filename.
import {
	Card,
	Dialog,
	DialogDescription,
	DialogPopup,
	DialogTitle,
	Stack,
} from "@mizen/ui";
import { isThemePreference, useTheme } from "@mizen/ui/theme";
import { useCallback, useState } from "react";

export default function App() {
	const [count, setCount] = useState(0);
	const [open, setOpen] = useState(false);
	const { theme, setTheme } = useTheme();
	const increment = useCallback(() => setCount((value) => value + 1), []);
	const showDialog = useCallback(() => setOpen(true), []);
	const changeTheme = useCallback(
		(event) => {
			if (isThemePreference(event.currentTarget.value)) {
				setTheme(event.currentTarget.value);
			}
		},
		[setTheme]
	);
	return (
		<Card>
			<Stack gap="3">
				<h1>Plain React + Vite</h1>
				<button onClick={increment} type="button">
					Count {count}
				</button>
				<label>
					Theme
					<select
						aria-label="Theme preference"
						onChange={changeTheme}
						value={theme}
					>
						<option value="system">System</option>
						<option value="light">Light</option>
						<option value="dark">Dark</option>
					</select>
				</label>
				<button onClick={showDialog} type="button">
					Choose segment
				</button>
				{open ? (
					<Dialog onOpenChange={setOpen} open={open}>
						<DialogPopup>
							<DialogTitle>Resource segment</DialogTitle>
							<DialogDescription>A client-only dialog.</DialogDescription>
						</DialogPopup>
					</Dialog>
				) : null}
			</Stack>
		</Card>
	);
}
