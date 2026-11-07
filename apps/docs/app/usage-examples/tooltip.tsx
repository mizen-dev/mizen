import {
	Button,
	Kbd,
	Tooltip,
	TooltipPopup,
	TooltipProvider,
	TooltipTrigger,
} from "@mizen-labs/ui";
import { IconKeyboard } from "@tabler/icons-react";

export function LinkTooltip() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							aria-label="Keyboard shortcuts"
							size="icon"
							variant="outline"
						>
							<IconKeyboard aria-hidden="true" focusable="false" size="1em" />
						</Button>
					}
				/>
				<TooltipPopup>
					Keyboard shortcuts <Kbd>?</Kbd>
				</TooltipPopup>
			</Tooltip>
		</TooltipProvider>
	);
}
