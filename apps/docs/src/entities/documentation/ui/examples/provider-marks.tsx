// Provider marks for the model picker examples. Anthropic and Gemini come
// from Simple Icons (CC0); Tabler has no mark for them.

function Mark({ d, label }: { d: string; label: string }) {
	return (
		<svg
			aria-label={label}
			fill="currentColor"
			height={16}
			role="img"
			viewBox="0 0 24 24"
			width={16}
		>
			<path d={d} />
		</svg>
	);
}

export function AnthropicMark() {
	return (
		<Mark
			d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"
			label="Anthropic"
		/>
	);
}

export function GeminiMark() {
	return (
		<Mark
			d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"
			label="Google Gemini"
		/>
	);
}
