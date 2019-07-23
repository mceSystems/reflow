import { Transports, Reflow } from "@mcesystems/reflow";
import { renderDisplayLayer } from "@mcesystems/reflow-react-display-layer";

import { ViewInterfacesType, viewInterfaces } from "./viewInterfaces";
import { views, Wrapper } from "./views";
import mainFlow from "./flows/main";

const transport = new Transports.InProcTransport({});

const reflow = new Reflow<ViewInterfacesType>({
	transport,
	views: viewInterfaces,
	// initial viewerParameters cann be passed when initiating the engine
	viewerParameters: {
		color: "orange"
	}
});

renderDisplayLayer({
	element: document.getElementById("main"),
	transport,
	views,
	// passing the wrapper component so the display layer renders it as the parent for the entire rendered view tree
	wrapper: Wrapper,
});

reflow.start(mainFlow)