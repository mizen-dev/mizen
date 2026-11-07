import { props } from "@stylexjs/stylex";
import type { ReactNode } from "react";
import {
	IconAlertTriangle,
	IconCircleCheck,
	IconCircleX,
	IconInfoCircle,
} from "../../icons";
import { Spinner } from "../spinner/spinner";
import { toastStyles } from "./toast.styles";

type ToastStatus = "error" | "info" | "loading" | "success" | "warning";

function isToastStatus(type: unknown): type is ToastStatus {
	return (
		type === "error" ||
		type === "info" ||
		type === "loading" ||
		type === "success" ||
		type === "warning"
	);
}

const statusStyles = {
	error: toastStyles.iconError,
	info: toastStyles.iconInfo,
	loading: toastStyles.iconLoading,
	success: toastStyles.iconSuccess,
	warning: toastStyles.iconWarning,
} as const;

const statusIcons = {
	error: IconCircleX,
	info: IconInfoCircle,
	loading: Spinner,
	success: IconCircleCheck,
	warning: IconAlertTriangle,
};

export function StatusIcon({
	type,
}: {
	readonly type?: string | undefined;
}): ReactNode {
	if (!isToastStatus(type)) {
		return null;
	}
	const Icon = statusIcons[type];
	return (
		<span
			aria-hidden="true"
			data-slot="toast-icon"
			{...props(toastStyles.icon, statusStyles[type])}
		>
			<Icon aria-hidden="true" focusable="false" size={16} />
		</span>
	);
}
