import type { Metadata } from "next";
import { PressSpecimen } from "./press-specimen";

export const metadata: Metadata = {
	robots: { index: false },
	title: "Press surfaces · Mizen UI",
};

export default function Page() {
	return <PressSpecimen />;
}
