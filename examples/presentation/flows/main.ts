import { Flow } from "@mcesystems/reflow";

import { ViewInterfacesType } from "../viewInterfaces";
import subPresentation from "./subPresentation";

export default <Flow<ViewInterfacesType>>(async ({ view, views, flow }) => {
	const presentationContainer = view(0, views.PresentationContainer, {
		title: "My Presentation"
	});

	await view(0, views.Slide, {
		title: "Slide 1",
		content: "This slide will go into the presentation container, as we stated it's the viewParent",
	}, presentationContainer);

	await view(0, views.Slide, {
		title: "Slide 2",
		content: "This slide will replace slide 1, as they both went to layer 0 of the same viewParent - the presentation container",
	}, presentationContainer);

	const slide3 = view(0, views.Slide, {
		title: "Slide 3",
		content: "This slide will be used to parent a flow as described below",
	}, presentationContainer);

	// now we'll start the subPresentation flow, and pass slide3 as the viewParent
	// you'll notice that in subPresentation, no viewParent needs to be declared - all views will automatically
	// enter the view tree as children of slide3
	await flow(subPresentation, {
		slides: [
			{
				title: "Sub-Slide 1",
				content: "Some content"
			},
			{
				title: "Sub-Slide 2",
				content: "Some more content"
			},
			{
				title: "Sub-Slide 3",
				content: "And even more content"
			}
		]
	}, slide3);
	await slide3
	await view(0, views.Slide, {
		title: "Thanks for using Reflow!",
		content: "\\m/",
	}, presentationContainer);
});

