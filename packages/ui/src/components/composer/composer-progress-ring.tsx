import { create, props } from "@stylexjs/stylex";
import { colors } from "../../styles/colors.stylex";

const styles = create({
	ring: { display: "block", flexShrink: 0, transform: "rotate(-90deg)" },
	track: { stroke: colors.controlSurface },
	value: { stroke: colors.brandForeground },
});

const RADIUS = 6;
const LENGTH = 2 * Math.PI * RADIUS;

/** A 16px ring showing a 0–1 share; decorative, so pair it with text. */
export function ProgressRing({ share }: { share: number }) {
	const done = Math.min(Math.max(share, 0), 1) * LENGTH;
	return (
		<svg
			aria-hidden="true"
			height="16"
			viewBox="0 0 16 16"
			width="16"
			{...props(styles.ring)}
		>
			<circle
				cx="8"
				cy="8"
				fill="none"
				r={RADIUS}
				strokeWidth="2"
				{...props(styles.track)}
			/>
			<circle
				cx="8"
				cy="8"
				fill="none"
				r={RADIUS}
				strokeDasharray={`${done} ${LENGTH}`}
				strokeLinecap="round"
				strokeWidth="2"
				{...props(styles.value)}
			/>
		</svg>
	);
}
