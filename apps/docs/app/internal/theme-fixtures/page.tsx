import { AvatarGroupSpecimen } from "../../components/[slug]/specimens/avatar-group-specimen";
import { AvatarSpecimen } from "../../components/[slug]/specimens/avatar-specimen";
import { CardSpecimen } from "../../components/[slug]/specimens/card-specimen";
import { EmptySpecimen } from "../../components/[slug]/specimens/empty-specimen";
import { ErrorStateSpecimen } from "../../components/[slug]/specimens/error-state-specimen";
import { LocallyThemedField, LocallyThemedSelect } from "./controls";

export default function Page() {
	return (
		<main>
			<AvatarSpecimen />
			<AvatarGroupSpecimen />
			<CardSpecimen />
			<EmptySpecimen />
			<ErrorStateSpecimen />
			<LocallyThemedField />
			<LocallyThemedSelect />
		</main>
	);
}
