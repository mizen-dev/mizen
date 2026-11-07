import {
	Avatar,
	AvatarCharacter,
	AvatarFallback,
	AvatarImage,
	Inline,
} from "@mizen-labs/ui";

// Photos where people have them; a generated character where they do not.
export function MemberAvatar() {
	return (
		<Inline>
			<Avatar size="lg">
				<AvatarImage alt="Maya Chen" src="/media/portrait-maya.jpg" />
				<AvatarFallback aria-label="Maya Chen" role="img">
					MC
				</AvatarFallback>
			</Avatar>
			<Avatar size="lg">
				<AvatarImage alt="Alex Rivera" src="/media/portrait-alex.jpg" />
				<AvatarFallback aria-label="Alex Rivera" role="img">
					AR
				</AvatarFallback>
			</Avatar>
			<Avatar size="lg">
				<AvatarImage alt="Jordan Lee" src="/media/portrait-jordan.jpg" />
				<AvatarFallback aria-label="Jordan Lee" role="img">
					JL
				</AvatarFallback>
			</Avatar>
			<AvatarCharacter label="Lina Park" seed="member:lina" size="lg" />
		</Inline>
	);
}
