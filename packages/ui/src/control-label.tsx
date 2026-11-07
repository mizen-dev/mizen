import { props } from "@stylexjs/stylex";
import {
	Children,
	cloneElement,
	Fragment,
	isValidElement,
	type ReactNode,
} from "react";
import { typographyStyles } from "./styles/typography.styles";

// Trim text, not the flex container: icons keep their own centered geometry.
// Adjacent text joins one span so `Archive ({count})` stays a single flex item.
export function controlLabel(children: ReactNode): ReactNode {
	const output: ReactNode[] = [];
	let text = "";
	const flushText = () => {
		if (text) {
			output.push(
				<span
					key={`text-${output.length}`}
					{...props(typographyStyles.controlLabel)}
				>
					{text}
				</span>
			);
			text = "";
		}
	};
	for (const child of Children.toArray(children)) {
		if (typeof child === "string" || typeof child === "number") {
			text += child;
			continue;
		}
		flushText();
		if (
			isValidElement<{ children?: ReactNode }>(child) &&
			child.type === Fragment
		) {
			output.push(
				cloneElement(child, { children: controlLabel(child.props.children) })
			);
		} else {
			output.push(child);
		}
	}
	flushText();
	return output.length > 0 ? output : null;
}
