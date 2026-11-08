"use client";
import {
	Button,
	Composer,
	ComposerActionGroup,
	ComposerActions,
	ComposerInput,
	ComposerPopup,
	ComposerStatus,
	ComposerSubmit,
	Spinner,
	Text,
	useComposerContext,
} from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import { IconArrowUp } from "@tabler/icons-react";
import { type FormEvent, useCallback, useState } from "react";
import { composerExampleStyles } from "../../../entities/documentation/ui/examples/composer";

// Sending, read-only, and disabled drafts.
export function ComposerStatesFixture() {
	return (
		<div {...props(composerExampleStyles.container)}>
			<Composer
				defaultValue={[{ text: "Review the release plan.", type: "text" }]}
				submitDisabled
			>
				<ComposerInput aria-label="Sending draft" />
				<ComposerActions>
					<ComposerActionGroup align="end">
						<ComposerSubmit
							render={
								<Button aria-label="Sending message" loading size="icon-sm">
									<IconArrowUp aria-hidden="true" size={18} />
								</Button>
							}
						/>
					</ComposerActionGroup>
				</ComposerActions>
			</Composer>
			<Composer
				defaultValue={[{ text: "This draft is read-only.", type: "text" }]}
				readOnly
			>
				<ComposerInput aria-label="Read-only draft" />
				<ComposerActions>
					<ComposerActionGroup align="end">
						<ComposerSubmit />
					</ComposerActionGroup>
				</ComposerActions>
			</Composer>
			<Composer
				defaultValue={[{ text: "Composer unavailable.", type: "text" }]}
				disabled
			>
				<ComposerInput aria-label="Disabled draft" />
				<ComposerActions>
					<ComposerActionGroup align="end">
						<ComposerSubmit />
					</ComposerActionGroup>
				</ComposerActions>
			</Composer>
		</div>
	);
}

function ResetComposer() {
	const { reset, isEmpty } = useComposerContext();
	return (
		<Button
			disabled={isEmpty}
			onClick={reset}
			size="sm"
			type="button"
			variant="ghost"
		>
			Reset draft
		</Button>
	);
}

// A composer inside another form submits with it and resets with it.
export function ComposerNestedFormFixture() {
	const [notice, setNotice] = useState("");
	const save = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setNotice(`Saved: ${new FormData(event.currentTarget).get("message")}`);
	}, []);
	return (
		<div {...props(composerExampleStyles.container)}>
			<form onSubmit={save}>
				<Composer
					defaultValue={[{ text: "Meeting notes", type: "text" }]}
					name="message"
					render={<div />}
					submitOnEnter="never"
				>
					<ComposerInput render={<textarea aria-label="Saved message" />} />
					<ComposerActions>
						<ComposerActionGroup>
							<ResetComposer />
						</ComposerActionGroup>
					</ComposerActions>
				</Composer>
				<Button size="sm" type="submit">
					Save message
				</Button>
			</form>
			<div aria-label="Message result" role="status">
				<Text size="ui" tone="muted">
					{notice}
				</Text>
			</div>
		</div>
	);
}

// Suggestions that are still loading.
export function ComposerSuggestionsStatesFixture() {
	return (
		<div {...props(composerExampleStyles.container)}>
			<Composer
				triggers={[
					{ character: "@", items: [], showEmpty: true, status: "loading" },
				]}
			>
				<ComposerInput
					aria-label="Searching mentions"
					placeholder="Type @ to see loading suggestions…"
				/>
				<ComposerPopup aria-busy>
					<ComposerStatus>
						<span>Searching teammates…</span>
						<Spinner aria-hidden="true" />
					</ComposerStatus>
				</ComposerPopup>
				<ComposerActions>
					<ComposerActionGroup align="end">
						<ComposerSubmit />
					</ComposerActionGroup>
				</ComposerActions>
			</Composer>
		</div>
	);
}
