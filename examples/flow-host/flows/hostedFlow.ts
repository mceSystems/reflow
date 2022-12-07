import { Flow } from "@mcesystems/reflow";

import { ViewInterfacesType } from "../viewInterfaces";

export default <Flow<ViewInterfacesType>>(async ({ view, views }) => {
	const userApproval = view(0, views.UserApproval, {
		title: "Please Approve",
		itemsToApprove: [
			"You agree",
			"You acknowledge",
			"Some consent"
		]
	});

	view(0, views.Disclaimer, {
		content: "This is the disclaimer text you should worry about",
	}, userApproval);

	userApproval.on("itemChanged", ({ checked, item }) => {
		console.log("[Hosted Flow]", `Got item changed event item=${item} checked=${checked}`);
	});

	const agreed = await userApproval;
	console.log("[Hosted Flow]", `UserApproval view done. Agreed? ${agreed}`);
});
