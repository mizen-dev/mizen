import {
	Badge,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Code,
	Stack,
} from "@mizen/ui";
import {
	PropertyList,
	PropertyListItem,
	PropertyListLabel,
	PropertyListValue,
} from "@mizen/ui/property-list";
import { SpecimenSection } from "./specimen-section";

export function PropertyListSpecimen() {
	return (
		<Stack gap="8">
			<SpecimenSection primary title="Deployment record">
				<PropertyList
					aria-label="Deployment metadata"
					data-testid="property-list-metadata"
				>
					<PropertyListItem>
						<PropertyListLabel>Environment</PropertyListLabel>
						<PropertyListValue>Production</PropertyListValue>
					</PropertyListItem>
					<PropertyListItem>
						<PropertyListLabel>Region</PropertyListLabel>
						<PropertyListValue>us-east-1</PropertyListValue>
					</PropertyListItem>
					<PropertyListItem>
						<PropertyListLabel>Deployment ID</PropertyListLabel>
						<PropertyListValue>
							<Code>
								dep_
								<wbr />
								01hz89k2v5
								<wbr />
								m4q7r9w3x1y8z4ab
							</Code>
						</PropertyListValue>
					</PropertyListItem>
					<PropertyListItem>
						<PropertyListLabel>Commit hash</PropertyListLabel>
						<PropertyListValue>
							<Code>
								commit_sha_
								<wbr />
								9f83b241
								<wbr />
								e57c603a
								<wbr />
								8d11c34a
								<wbr />
								9b6c0e81
								<wbr />
								2d45ef8a
							</Code>
						</PropertyListValue>
					</PropertyListItem>
				</PropertyList>
			</SpecimenSection>

			<SpecimenSection title="Service health">
				<PropertyList
					aria-label="System status"
					data-testid="property-list-rich"
				>
					<PropertyListItem>
						<PropertyListLabel>Service status</PropertyListLabel>
						<PropertyListValue>
							<Badge variant="success">Operational</Badge>
						</PropertyListValue>
					</PropertyListItem>
					<PropertyListItem>
						<PropertyListLabel>API endpoint</PropertyListLabel>
						<PropertyListValue>
							<Code>
								https://
								<wbr />
								api.
								<wbr />
								internal.
								<wbr />
								network/
								<wbr />
								v2
							</Code>
						</PropertyListValue>
					</PropertyListItem>
					<PropertyListItem>
						<PropertyListLabel>Security review</PropertyListLabel>
						<PropertyListValue>
							<Badge variant="secondary">Verified</Badge>
						</PropertyListValue>
					</PropertyListItem>
					<PropertyListItem>
						<PropertyListLabel>Retry policy</PropertyListLabel>
						<PropertyListValue>Exponential backoff (5 max)</PropertyListValue>
					</PropertyListItem>
				</PropertyList>
			</SpecimenSection>

			<SpecimenSection canvas={false} title="Cluster details">
				<Card data-testid="property-list-card">
					<CardHeader>
						{/* biome-ignore lint/a11y/useHeadingContent: CardTitle supplies accessible text to the rendered heading */}
						<CardTitle render={<h3 />}>Database cluster</CardTitle>
						<CardDescription render={<p />}>
							Runtime configuration and storage specifications.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<PropertyList aria-label="Database cluster details">
							<PropertyListItem>
								<PropertyListLabel>Engine</PropertyListLabel>
								<PropertyListValue>PostgreSQL 16.3</PropertyListValue>
							</PropertyListItem>
							<PropertyListItem>
								<PropertyListLabel>Topology</PropertyListLabel>
								<PropertyListValue>Primary with read replica</PropertyListValue>
							</PropertyListItem>
							<PropertyListItem>
								<PropertyListLabel>Cluster ID</PropertyListLabel>
								<PropertyListValue>
									<Code>
										cluster_
										<wbr />
										primary_
										<wbr />
										prod_
										<wbr />
										east_
										<wbr />
										db_
										<wbr />
										00491823
									</Code>
								</PropertyListValue>
							</PropertyListItem>
						</PropertyList>
					</CardContent>
				</Card>
			</SpecimenSection>
		</Stack>
	);
}
