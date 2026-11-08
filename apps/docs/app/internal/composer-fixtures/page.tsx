import {
	ComposerNestedFormFixture,
	ComposerStatesFixture,
	ComposerSuggestionsStatesFixture,
} from "./fixtures";
import { ComposerPresentationFixture } from "./presentation-fixture";
import { ComposerRegressionFixture } from "./regression-fixture";

export const metadata = {
	robots: { index: false },
	title: "Composer fixtures · Mizen UI",
};

// States the browser tests exercise that are not worth a docs example.
export default function Page() {
	return (
		<main>
			<ComposerRegressionFixture />
			<ComposerPresentationFixture />
			<section id="ComposerStatesExample">
				<ComposerStatesFixture />
			</section>
			<section id="ComposerNestedFormExample">
				<ComposerNestedFormFixture />
			</section>
			<section id="ComposerSuggestionsStatesExample">
				<ComposerSuggestionsStatesFixture />
			</section>
		</main>
	);
}
