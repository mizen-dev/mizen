"use client";

import {
	Composer,
	type ComposerChangeDetails,
	ComposerInput,
	ComposerItem,
	ComposerList,
	ComposerPopup,
	type ComposerQuery,
	type ComposerValue,
	getComposerText,
} from "@mizen/ui/composer";
import { type FormEvent, StrictMode, useCallback, useState } from "react";

const INITIAL: ComposerValue = [{ text: "Initial", type: "text" }];
const TOKEN: ComposerValue = [
	{ text: "A😀", type: "text" },
	{
		data: "person-1",
		id: "maya",
		label: "Maya",
		text: "@maya",
		trigger: "@",
		type: "mention",
	},
	{ text: "Z", type: "text" },
];
const ITEMS = [
	{ id: "maya", label: "Maya" },
	{ id: "max", label: "Max" },
];
export function ComposerRegressionFixture() {
	const [value, setValue] = useState(INITIAL);
	const [reject, setReject] = useState(false);
	const [mounted, setMounted] = useState(true);
	const [native, setNative] = useState(false);
	const [cancelReset, setCancelReset] = useState(false);
	const [changes, setChanges] = useState<string[]>([]);
	const [query, setQuery] = useState<ComposerQuery | null>(null);
	const toggleReject = useCallback(() => setReject((old) => !old), []);
	const replace = useCallback(
		() => setValue([{ text: "External", type: "text" }]),
		[]
	);
	const loadToken = useCallback(() => setValue(TOKEN), []);
	const toggleInput = useCallback(() => setMounted((old) => !old), []);
	const toggleNative = useCallback(() => setNative((old) => !old), []);
	const toggleCancel = useCallback(() => setCancelReset((old) => !old), []);
	const resetForm = useCallback(
		(event: FormEvent) => {
			if (cancelReset) {
				event.preventDefault();
			}
		},
		[cancelReset]
	);
	const change = useCallback(
		(next: ComposerValue, details: ComposerChangeDetails) => {
			setChanges((old) => [
				...old,
				`${details.reason}:${getComposerText(next)}`,
			]);
			if (!reject) {
				setValue(next);
			}
		},
		[reject]
	);

	return (
		<StrictMode>
			<section aria-label="Editor regressions">
				<button onClick={toggleReject} type="button">
					{reject ? "Accept edits" : "Reject edits"}
				</button>
				<button onClick={replace} type="button">
					Replace value
				</button>
				<button onClick={loadToken} type="button">
					Load token
				</button>
				<button onClick={toggleInput} type="button">
					Toggle input
				</button>
				<button onClick={toggleNative} type="button">
					Toggle input mode
				</button>
				<button onClick={toggleCancel} type="button">
					Toggle reset cancellation
				</button>
				<form onReset={resetForm}>
					<Composer
						defaultValue={INITIAL}
						name="draft"
						onQueryChange={setQuery}
						onValueChange={change}
						render={<div />}
						submitOnEnter="never"
						triggers={[{ character: "@", items: ITEMS }]}
						value={value}
					>
						{!!mounted && (
							<ComposerInput
								aria-label="Regression draft"
								render={native ? <textarea /> : undefined}
							/>
						)}
						<ComposerPopup>
							<ComposerList>
								{(item) => (
									<ComposerItem key={item.id} value={item}>
										{item.label}
									</ComposerItem>
								)}
							</ComposerList>
						</ComposerPopup>
					</Composer>
					<button type="reset">Reset regression draft</button>
				</form>
				<output aria-label="Owned draft">{getComposerText(value)}</output>
				<output aria-label="Change log">{JSON.stringify(changes)}</output>
				<output aria-label="Active query">{query?.text ?? "none"}</output>
			</section>
		</StrictMode>
	);
}
