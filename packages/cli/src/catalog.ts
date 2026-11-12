export interface ApiProperty {
	defaultValue: string;
	description: string;
	name: string;
	type: string;
}

export interface Component {
	api: ApiProperty[];
	apiSections?: {
		name: string;
		description: string;
		properties: ApiProperty[];
	}[];
	category: string;
	contract?: Record<string, unknown>;
	description: string;
	documentationPath: string;
	entryPoint: string;
	guidance: { boundaries: string[]; recommendations: string[] };
	name: string;
	slug: string;
	status: string;
	usageSections?: {
		id: string;
		title: string;
		description: string;
		code: string;
	}[];
}

export interface Catalog {
	cliVersion: string;
	components: Component[];
	nodeRange: string;
	/** Theme files by preset name, as init writes them into an app. */
	presets: Record<string, string>;
	uiPeerDependencies: Record<string, string>;
	uiVersion: string;
}
