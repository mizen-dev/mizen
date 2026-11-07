import {
	Avatar,
	AvatarCharacter,
	AvatarFallback,
	AvatarGroup,
	AvatarImage,
} from "@mizen-labs/ui";

export function ProjectContributors() {
	return (
		<AvatarGroup aria-label="Project contributors" role="group" size="lg">
			<Avatar>
				<AvatarImage alt="Maya Chen" src="/media/portrait-maya.jpg" />
				<AvatarFallback>MC</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarImage alt="Alex Rivera" src="/media/portrait-alex.jpg" />
				<AvatarFallback>AR</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarImage alt="Jordan Lee" src="/media/portrait-jordan.jpg" />
				<AvatarFallback>JL</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarFallback>
					<AvatarCharacter label="Lina Park" seed="member:lina" size="lg" />
				</AvatarFallback>
			</Avatar>
		</AvatarGroup>
	);
}
