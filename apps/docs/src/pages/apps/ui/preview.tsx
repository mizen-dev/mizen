import { apps } from "../../../entities/documentation/ui/apps";

export default function AppPreview({ name }: { name: string }) {
	const App = apps[name]?.App;
	return <div data-slot="app-preview">{App ? <App /> : null}</div>;
}
