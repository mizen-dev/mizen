/**
 * Mizen owns styling: parts never accept className or style. Distributes over
 * unions, so discriminated prop types keep their variants.
 */
export type Closed<T> = T extends unknown
	? Omit<T, "className" | "style">
	: never;
