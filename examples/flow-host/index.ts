import { Transports, Reflow } from "@mcesystems/reflow";
import { renderDisplayLayer } from "@mcesystems/reflow-react-display-layer";

import { ViewInterfacesType, viewInterfaces } from "./viewInterfaces";
import { views } from "./views";
import sharedTransport from "./sharedTransport";
import mainFlow from "./flows/main";
import hostedFlow from "./flows/hostedFlow";

const transport = new Transports.InProcTransport({});

const hostReflow = new Reflow<ViewInterfacesType>({
	transport,
	views: viewInterfaces,
});

renderDisplayLayer({
	element: document.getElementById("main"),
	transport,
	views,
});

hostReflow.start(mainFlow)


const hostedReflow = new Reflow<ViewInterfacesType>({
	transport: sharedTransport,
	views: viewInterfaces,
});

hostedReflow.start(hostedFlow);