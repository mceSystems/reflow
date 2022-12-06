import { Flow } from "@mcesystems/reflow";
import sharedTransport from "../sharedTransport";

import { ViewInterfacesType } from "../viewInterfaces";

export default <Flow<ViewInterfacesType>>(async ({ view, views, pipeDisplayLayer }) => {
	const host = view(0, views.FlowHost, {
		title: "This is the host"
	});

	pipeDisplayLayer(sharedTransport, host);

	await host;
});

