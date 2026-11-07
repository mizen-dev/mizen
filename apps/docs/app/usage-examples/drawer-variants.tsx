import {
	Badge,
	Button,
	Drawer,
	DrawerClose,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerPanel,
	DrawerPopup,
	DrawerTitle,
	DrawerTrigger,
	Stack,
	Text,
} from "@mizen-labs/ui";

export function DrawerProductionWorkspaceExample1() {
	return (
		<Stack gap="4">
			<Drawer position="bottom">
				<DrawerTrigger
					render={<Button variant="outline">View project activity</Button>}
				/>
				<DrawerPopup showBar variant="inset">
					<DrawerHeader>
						<DrawerTitle>Project activity</DrawerTitle>
						<DrawerDescription>
							Recent events and deployment updates for this project.
						</DrawerDescription>
					</DrawerHeader>
					<DrawerPanel allowSelection scrollable>
						<Stack gap="3">
							<Stack gap="1">
								<Text size="ui" tone="muted">
									<Badge size="sm" variant="success">
										Deployed
									</Badge>{" "}
									Production release v2.4.1 completed.
								</Text>
								<Text size="caption">2 minutes ago by automated pipeline</Text>
							</Stack>
							<Stack gap="1">
								<Text size="ui" tone="muted">
									<Badge size="sm" variant="info">
										Sync
									</Badge>{" "}
									Schema migrations applied to primary database cluster.
								</Text>
								<Text size="caption">14 minutes ago by release-bot</Text>
							</Stack>
							<Stack gap="1">
								<Text size="ui" tone="muted">
									<Badge size="sm" variant="brand">
										Build
									</Badge>{" "}
									Static site assets generated and cached across edge nodes.
								</Text>
								<Text size="caption">28 minutes ago by ci-runner-04</Text>
							</Stack>
							<Stack gap="1">
								<Text size="ui" tone="muted">
									<Badge size="sm" variant="default">
										Audit
									</Badge>{" "}
									Automated vulnerability scan passed with zero findings.
								</Text>
								<Text size="caption">1 hour ago by security-agent</Text>
							</Stack>
						</Stack>
					</DrawerPanel>
					<DrawerFooter>
						<DrawerClose
							render={<Button variant="outline">Close activity</Button>}
						/>
					</DrawerFooter>
				</DrawerPopup>
			</Drawer>
		</Stack>
	);
}
