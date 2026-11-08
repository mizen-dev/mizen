"use client";
import { ScrollArea } from "@mizen-labs/ui/scroll-area";
import { props } from "@stylexjs/stylex";
import {
	dualAxisDeployments,
	horizontalClusterNodes,
	noOverflowEntries,
	securityAuditEntries,
	verticalAuditEntries,
} from "../specimens/scroll-area-fixtures";
import { specimenStyles } from "../specimens/scroll-area-specimen.styles";

export function ScrollAreaReleaseActivityExample1() {
	return (
		<div {...props(specimenStyles.box)}>
			<ScrollArea
				aria-label="Audit entries"
				overscrollContain
				role="region"
				scrollbarGutter
				scrollFade
			>
				<ul {...props(specimenStyles.list)}>
					{verticalAuditEntries.map((entry) => (
						<li key={entry.id} {...props(specimenStyles.listItem)}>
							<span {...props(specimenStyles.itemLabel)}>
								{entry.id} — {entry.service}
							</span>
							<span {...props(specimenStyles.itemDetails)}>
								{entry.status} ({entry.timestamp})
							</span>
						</li>
					))}
				</ul>
			</ScrollArea>
		</div>
	);
}
export function ScrollAreaClusterHealthExample2() {
	return (
		<div {...props(specimenStyles.horizontalBox)}>
			<ScrollArea aria-label="Cluster health" role="region" scrollbarGutter>
				<div {...props(specimenStyles.wideContainer)}>
					<table {...props(specimenStyles.table)}>
						<thead>
							<tr>
								<th {...props(specimenStyles.th)}>Node ID</th>
								<th {...props(specimenStyles.th)}>Region</th>
								<th {...props(specimenStyles.th)}>Instance</th>
								<th {...props(specimenStyles.th)}>CPU</th>
								<th {...props(specimenStyles.th)}>Memory</th>
								<th {...props(specimenStyles.th)}>Status</th>
								<th {...props(specimenStyles.th)}>Uptime</th>
							</tr>
						</thead>
						<tbody>
							{horizontalClusterNodes.map((node) => (
								<tr key={node.id}>
									<td {...props(specimenStyles.td)}>{node.id}</td>
									<td {...props(specimenStyles.td)}>{node.region}</td>
									<td {...props(specimenStyles.td)}>{node.type}</td>
									<td {...props(specimenStyles.td)}>{node.cpu}</td>
									<td {...props(specimenStyles.td)}>{node.memory}</td>
									<td {...props(specimenStyles.td)}>{node.status}</td>
									<td {...props(specimenStyles.td)}>{node.uptime}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ScrollArea>
		</div>
	);
}
export function ScrollAreaDeploymentMatrixExample3() {
	return (
		<div {...props(specimenStyles.dualAxisBox)}>
			<ScrollArea
				aria-label="Deployment matrix"
				overscrollContain
				role="region"
				scrollbarGutter
				scrollFade
			>
				<div {...props(specimenStyles.wideContainer)}>
					<table {...props(specimenStyles.table)}>
						<thead>
							<tr>
								<th {...props(specimenStyles.th)}>Environment</th>
								<th {...props(specimenStyles.th)}>Region</th>
								<th {...props(specimenStyles.th)}>Version</th>
								<th {...props(specimenStyles.th)}>Commit</th>
								<th {...props(specimenStyles.th)}>Latency</th>
								<th {...props(specimenStyles.th)}>Status</th>
							</tr>
						</thead>
						<tbody>
							{dualAxisDeployments.map((item) => (
								<tr key={item.env}>
									<td {...props(specimenStyles.td)}>{item.env}</td>
									<td {...props(specimenStyles.td)}>{item.region}</td>
									<td {...props(specimenStyles.td)}>{item.version}</td>
									<td {...props(specimenStyles.td)}>{item.commit}</td>
									<td {...props(specimenStyles.td)}>{item.latency}</td>
									<td {...props(specimenStyles.td)}>{item.status}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</ScrollArea>
		</div>
	);
}
export function ScrollAreaWorkspaceSummaryExample4() {
	return (
		<div {...props(specimenStyles.noOverflowBox)}>
			<ScrollArea aria-label="Workspace summary" role="region">
				<ul {...props(specimenStyles.list)}>
					{noOverflowEntries.map((entry) => (
						<li key={entry.label} {...props(specimenStyles.listItem)}>
							<span {...props(specimenStyles.itemLabel)}>{entry.label}</span>
							<span {...props(specimenStyles.itemDetails)}>
								{entry.description}
							</span>
						</li>
					))}
				</ul>
			</ScrollArea>
		</div>
	);
}
export function ScrollAreaSecurityActivityInRTLExample5() {
	return (
		<div data-testid="scroll-area-rtl" {...props(specimenStyles.rtlContainer)}>
			<div {...props(specimenStyles.box)}>
				<ScrollArea
					aria-label="Security activity"
					dir="rtl"
					role="region"
					scrollbarGutter
					scrollFade
				>
					<ul {...props(specimenStyles.list)}>
						{securityAuditEntries.map((entry) => (
							<li key={entry.id} {...props(specimenStyles.listItem)}>
								<span {...props(specimenStyles.itemLabel)}>
									{entry.id} — {entry.service}
								</span>
								<span {...props(specimenStyles.itemDetails)}>
									{entry.status} ({entry.timestamp})
								</span>
							</li>
						))}
					</ul>
				</ScrollArea>
			</div>
		</div>
	);
}
