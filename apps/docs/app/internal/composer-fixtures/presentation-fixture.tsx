"use client";

import {
	Composer,
	ComposerActionGroup,
	ComposerActions,
	ComposerInput,
	ComposerItem,
	ComposerList,
	ComposerPopup,
	ComposerStatus,
	ComposerSubmit,
	ComposerToken,
	type ComposerTokenPart,
} from "@mizen-labs/ui/composer";
import {
	type ComponentProps,
	type KeyboardEvent,
	type MouseEvent,
	useCallback,
	useState,
} from "react";

const PEOPLE = [
	{ id: "maya", label: "Maya" },
	{ id: "max", label: "Max" },
];
function tokenView(token: ComposerTokenPart) {
	return (
		<ComposerToken token={token} variant="chip">
			<strong>{token.label}</strong>
		</ComposerToken>
	);
}
function optionView(
	props: ComponentProps<"button">,
	state: { highlighted: boolean; disabled: boolean }
) {
	return <button {...props} data-active={state.highlighted} type="button" />;
}
export function ComposerPresentationFixture() {
	const [mounted, setMounted] = useState(false);
	const [cancel, setCancel] = useState(true);
	const [sent, setSent] = useState(0);
	const [bindings, setBindings] = useState(0);
	const bind = useCallback((node: HTMLDivElement | null) => {
		if (!node) {
			return;
		}
		setBindings((old) => old + 1);
		return () => setBindings((old) => old - 1);
	}, []);
	const toggle = useCallback(() => setMounted((old) => !old), []);
	const permit = useCallback(() => setCancel(false), []);
	const submit = useCallback(() => setSent((old) => old + 1), []);
	const click = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			if (cancel) {
				event.preventDefault();
			}
		},
		[cancel]
	);
	const key = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (cancel && event.key === "Enter") {
				event.preventDefault();
			}
		},
		[cancel]
	);
	return (
		<section aria-label="Presentation contracts">
			<button onClick={toggle} type="button">
				Toggle presentation
			</button>
			<button onClick={permit} type="button">
				Allow submission
			</button>
			{!!mounted && (
				<Composer
					name="presentation-draft"
					onSubmit={submit}
					triggers={[{ character: "@", items: PEOPLE }]}
				>
					<ComposerInput
						aria-label="Presentation draft"
						onKeyDown={key}
						ref={bind}
						renderToken={tokenView}
					/>
					<ComposerPopup>
						<ComposerList render={<section data-custom="list" />}>
							{(item) => (
								<ComposerItem key={item.id} render={optionView} value={item}>
									{item.label}
								</ComposerItem>
							)}
						</ComposerList>
					</ComposerPopup>
					<ComposerStatus render={<aside />}>Ready</ComposerStatus>
					<ComposerActions>
						<ComposerActionGroup align="end">
							<ComposerSubmit onClick={click} />
						</ComposerActionGroup>
					</ComposerActions>
				</Composer>
			)}
			<output aria-label="Presentation sends">{sent}</output>
			<output aria-label="Presentation bindings">{bindings}</output>
		</section>
	);
}
