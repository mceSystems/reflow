import { Transports, Reflow } from "@mcesystems/reflow";
import { renderDisplayLayer } from "@mcesystems/reflow-react-display-layer";

import { ViewInterfacesType, viewInterfaces } from "./viewInterfaces";
import { views } from "./views";
import mainFlow from "./flows/main";

const transport = new Transports.InProcTransport({});

const reflow = new Reflow<ViewInterfacesType>({
	transport,
	views: viewInterfaces,
});

renderDisplayLayer({
	element: document.getElementById("main"),
	transport,
	views,
});

reflow.start(mainFlow)