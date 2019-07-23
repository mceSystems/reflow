import { Flow } from "@mcesystems/reflow";

import { ViewInterfacesType } from "../viewInterfaces";
import { Input as Slide } from "../viewInterfaces/Slide";

// lets have this flow get its slide definition as an input
export interface Input {
	slides: Slide[]
}

export default <Flow<ViewInterfacesType, Input>>(async ({ view, views, input: { slides } }) => {
	for (const slide of slides) {
		await view(0, views.Slide, slide);
	}
});

