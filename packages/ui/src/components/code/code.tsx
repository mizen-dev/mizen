import { props } from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { codeStyles } from "./code.styles";

type NativeCodeProps = ComponentPropsWithRef<"code">;

export type CodeProps = Omit<NativeCodeProps, "className" | "role" | "style">;

export function Code({ children, ref: forwardedRef, ...rest }: CodeProps) {
	Reflect.deleteProperty(rest, "role");

	return (
		<code
			{...rest}
			data-slot="code"
			ref={forwardedRef}
			{...props(codeStyles.base)}
		>
			{children}
		</code>
	);
}
