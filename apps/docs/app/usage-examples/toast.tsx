"use client";

import { Button } from "@mizen/ui";
import { toastManager } from "@mizen/ui/toast";
import { useCallback } from "react";

export function ExampleToast() {
	const copyLink = useCallback(() => {
		toastManager.add({
			description: "Anyone on the Northstar team can open it.",
			title: "Link copied",
			type: "success",
		});
	}, []);
	return (
		<Button onClick={copyLink} variant="outline">
			Copy link
		</Button>
	);
}
