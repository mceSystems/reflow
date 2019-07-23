import { Flow } from "@mcesystems/reflow";

import { ViewInterfacesType, ViewerParameters } from "../viewInterfaces";

export default <Flow<ViewInterfacesType>>(async ({ view, views, viewerParameters }) => {
	// let create a "theme" dictionary
	const themes = {
		red: "red",
		green: "green",
		blue: "blue",
		yellow: "yellow",
	};
	view(0, views.ThemeTester, {
		header: "Choose Theme",
		subHeader: "This text will change colors according to your choice",
		themes: Object.keys(themes),
	})
		.on("changeTheme", ({ theme }) => {
			// change the theme using viewerParameters
			viewerParameters({
				color: theme,
			} as ViewerParameters)
		})
	// awaiting a never-ending promise to hang the flow
	await new Promise(() => { });
});

