import { Fragment } from "react";

const IDENTIFIER_BOUNDARY = /(?=[A-Z][a-z])/u;

export function wrapIdentifier(value: string) {
	return value.split(IDENTIFIER_BOUNDARY).map((part, index) => (
		// biome-ignore lint/suspicious/noArrayIndexKey: Static text fragments have no state or independent identity.
		<Fragment key={index}>
			<wbr />
			{part}
		</Fragment>
	));
}
