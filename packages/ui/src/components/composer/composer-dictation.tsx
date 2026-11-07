"use client";

import { props } from "@stylexjs/stylex";
import { useCallback } from "react";
import { IconMicrophone } from "../../icons";
import { Button } from "../button/button";
import { useComposerContext } from "./composer-editor";
import { composerPartStyles as styles } from "./composer-parts.styles";

export interface ComposerDictationProps {
	/** The name stays the same while it records; `aria-pressed` says the state. */
	"aria-label"?: string;
	/** True while the app records speech. */
	listening: boolean;
	/**
	 * Called with the next state when it is pressed. The app starts or stops
	 * its recognizer and puts the words into the draft.
	 */
	onListeningChange: (listening: boolean) => void;
}

/**
 * A microphone button for the toolbar. Pressing it asks the app to start or
 * stop dictation; while it records, the button turns brand and a soft ring
 * pulses. Mizen does no speech recognition itself.
 */
export function ComposerDictation({
	"aria-label": ariaLabel = "Dictate",
	listening,
	onListeningChange,
}: ComposerDictationProps) {
	const { disabled, readOnly } = useComposerContext();
	const toggle = useCallback(
		() => onListeningChange(!listening),
		[listening, onListeningChange]
	);
	return (
		<Button
			aria-label={ariaLabel}
			aria-pressed={listening}
			disabled={disabled || readOnly}
			onClick={toggle}
			size="icon-sm"
			type="button"
			variant="ghost"
		>
			<span
				aria-hidden="true"
				data-listening={listening || undefined}
				{...props(styles.dictation)}
			>
				<IconMicrophone size={18} />
			</span>
		</Button>
	);
}
