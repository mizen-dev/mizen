import { AvatarGroupSpecimen } from "../../../entities/documentation/ui/specimens/avatar-group-specimen";
import { AvatarSpecimen } from "../../../entities/documentation/ui/specimens/avatar-specimen";
import { CardSpecimen } from "../../../entities/documentation/ui/specimens/card-specimen";
import { EmptySpecimen } from "../../../entities/documentation/ui/specimens/empty-specimen";
import { ErrorStateSpecimen } from "../../../entities/documentation/ui/specimens/error-state-specimen";
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
