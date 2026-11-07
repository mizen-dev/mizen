"use client";

import { Funnel } from "@mizen/ui";
import {
	IconBolt,
	IconBuilding,
	IconCrown,
	IconEye,
	IconUserPlus,
	IconUsers,
} from "@tabler/icons-react";

export function SignupPipeline() {
	return (
		<Funnel
			aria-label="Signup pipeline, last 7 days"
			stages={[
				{ icon: <IconEye />, id: "visits", label: "Visits", value: 1180 },
				{ icon: <IconUserPlus />, id: "signup", label: "Sign-up", value: 790 },
				{ icon: <IconBolt />, id: "active", label: "Active", value: 460 },
				{ icon: <IconCrown />, id: "pro", label: "Pro", value: 250 },
				{ icon: <IconUsers />, id: "team", label: "Team", value: 120 },
				{
					icon: <IconBuilding />,
					id: "enterprise",
					label: "Enterprise",
					value: 40,
				},
			]}
		/>
	);
}
