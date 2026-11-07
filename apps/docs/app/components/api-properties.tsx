import { TableContainer } from "@mizen-labs/ui";
import { props } from "@stylexjs/stylex";
import type { ApiProperty, ComponentDoc } from "../docs-registry";
import { docsStyles } from "./docs.styles";
import { wrapIdentifier } from "./wrap-identifier";

function ApiProperties({
	label,
	properties,
}: {
	label: string;
	properties: readonly ApiProperty[];
}) {
	return (
		<TableContainer aria-label={label}>
			<table {...props(docsStyles.apiTable)}>
				<colgroup>
					<col {...props(docsStyles.apiNameColumn)} />
					<col {...props(docsStyles.apiTypeColumn)} />
					<col {...props(docsStyles.apiDefaultColumn)} />
					<col {...props(docsStyles.apiDescriptionColumn)} />
				</colgroup>
				<thead>
					<tr>
						{["Prop", "Type", "Default", "Description"].map((heading) => (
							<th key={heading} scope="col" {...props(docsStyles.apiHeader)}>
								{heading}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{properties.map((property) => (
						<tr key={property.name}>
							<th scope="row" {...props(docsStyles.apiValue)}>
								<code {...props(docsStyles.apiCode)}>
									{wrapIdentifier(property.name)}
								</code>
							</th>
							<td {...props(docsStyles.apiValue)}>
								<code {...props(docsStyles.apiCode, docsStyles.apiType)}>
									{wrapIdentifier(property.type)}
								</code>
							</td>
							<td {...props(docsStyles.apiValue)}>
								<code {...props(docsStyles.apiCode)}>
									{property.defaultValue}
								</code>
							</td>
							<td {...props(docsStyles.apiValue)}>{property.description}</td>
						</tr>
					))}
				</tbody>
			</table>
		</TableContainer>
	);
}

export function ComponentApiProperties({
	component,
}: {
	component: ComponentDoc;
}) {
	return (
		<>
			{component.apiSections ? (
				component.apiSections.map((section) => (
					<section
						aria-labelledby={`api-${section.name}-heading`}
						id={`api-${section.name}`}
						key={section.name}
						{...props(docsStyles.documentSection)}
					>
						<h3
							id={`api-${section.name}-heading`}
							{...props(docsStyles.sectionTitle, docsStyles.usageTitle)}
						>
							{section.name}
						</h3>
						<p {...props(docsStyles.documentDescription)}>
							{section.description}
						</p>
						<ApiProperties
							label={`${section.name} API properties`}
							properties={section.properties}
						/>
					</section>
				))
			) : (
				<ApiProperties
					label={`${component.name} API properties`}
					properties={component.api}
				/>
			)}
		</>
	);
}
