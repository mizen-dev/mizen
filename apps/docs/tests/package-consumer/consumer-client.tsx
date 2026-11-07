"use client";

import {
	Button,
	Composer,
	ComposerActionGroup,
	ComposerActions,
	ComposerInput,
	ComposerSubmit,
	type ComposerValue,
} from "@mizen/ui";
import { useState } from "react";

export function ClientPromptComposer() {
	const [value, setValue] = useState<ComposerValue>([]);
	return (
		<Composer onValueChange={setValue} value={value}>
			<ComposerInput
				aria-label="Ask about this project"
				render={<textarea />}
			/>
			<ComposerActions>
				<ComposerActionGroup align="end">
					<ComposerSubmit render={<Button size="sm">Send</Button>} />
				</ComposerActionGroup>
			</ComposerActions>
		</Composer>
	);
}
