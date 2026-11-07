"use client";
import { Field, FieldLabel, Input, Stack, Switch } from "@mizen/ui";
import { Button } from "@mizen/ui/button";
import {
	Frame,
	FrameDescription,
	FrameFooter,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@mizen/ui/frame";
import { Group } from "@mizen/ui/group";
import { Text } from "@mizen/ui/text";
import { type FormEvent, useCallback, useState } from "react";

export function FramePersonalWorkspaceExample1() {
	const [status, setStatus] = useState("Preferences stay in this preview.");
	const save = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatus("Preferences saved in this preview.");
	}, []);
	const reset = useCallback(
		() => setStatus("Preferences stay in this preview."),
		[]
	);
	return (
		<Stack gap="4">
			<form onReset={reset} onSubmit={save}>
				<Frame>
					<FrameHeader>
						<FrameTitle>Account settings</FrameTitle>
						<FrameDescription>
							Manage your personal profile and notification preferences.
						</FrameDescription>
					</FrameHeader>
					<FramePanel>
						<Stack gap="6">
							<Field>
								<FieldLabel>Display name</FieldLabel>
								<Input defaultValue="Maya Chen" name="name" />
							</Field>
							<Field>
								<FieldLabel>Email address</FieldLabel>
								<Input
									defaultValue="maya@example.com"
									name="email"
									type="email"
								/>
							</Field>
							<Field>
								<FieldLabel>Weekly project summary</FieldLabel>
								<Switch defaultChecked name="summary" />
							</Field>
							<Text aria-live="polite" size="ui" tone="muted">
								{status}
							</Text>
						</Stack>
					</FramePanel>
					<FrameFooter>
						<Group>
							<Button size="sm" type="submit" variant="brand">
								Save preferences
							</Button>
							<Button size="sm" type="reset" variant="secondary">
								Discard changes
							</Button>
						</Group>
					</FrameFooter>
				</Frame>
			</form>
		</Stack>
	);
}
