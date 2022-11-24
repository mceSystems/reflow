import { Flow } from "@mcesystems/reflow";

import { ViewInterfacesType } from "../../viewInterfaces";
import Contact from "../../viewInterfaces/shared/Contact";

export type FlowInput = {
	contact?: Contact
};
export default <Flow<ViewInterfacesType, FlowInput, Contact>>(async ({ view, views, input: { contact = { name: "", phoneNumber: "" } } }) => {
	const nameOutput = await view(0, views.EditContactField, {
		label: "Name",
		currentValue: contact.name,
		error: null,
	});
	const phoneOutput = await view(0, views.EditContactField, {
		label: "Phone Number",
		currentValue: contact.phoneNumber,
		error: null,
	});

	let emailValidationError = null;
	let emailAddress;
	while (true) {
		const emailOutput = await view(0, views.EditContactField, {
			label: "Email",
			currentValue: contact.email || "",
			error: emailValidationError,
			skipEnabled: true,
		});
		if (emailOutput.skipped) {
			break;
		}
		if (!emailOutput.newValue.match(/(.*?)@(.*?).com/)) {
			emailValidationError = "Only <something>@<domain>.com addresses are allowed";
			continue;
		}
		emailAddress = emailOutput.newValue;
		break;
	}


	return {
		name: nameOutput.newValue,
		phoneNumber: phoneOutput.newValue,
		email: emailAddress,
	};
});
