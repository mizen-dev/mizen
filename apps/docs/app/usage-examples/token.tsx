import { Inline, Token } from "@mizen-labs/ui";
import { IconAccessible, IconKeyboard } from "@tabler/icons-react";

export function CategoryTokens() {
	return (
		<Inline>
			<Token
				color="purple"
				icon={<IconAccessible aria-hidden size={14} />}
				label="Accessibility"
			/>
			<Token
				color="blue"
				icon={<IconKeyboard aria-hidden size={14} />}
				label="Keyboard"
			/>
			<Token color="green" label="Ready for review" />
		</Inline>
	);
}
