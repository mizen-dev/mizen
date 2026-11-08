import { homepage } from "../../../package.json";

export function canonical(path: string) {
	return { href: new URL(path, homepage).href, rel: "canonical" };
}
