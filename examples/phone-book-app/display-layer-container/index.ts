import { Transports, Reflow } from "@mcesystems/reflow";
import { renderDisplayLayer } from "@mcesystems/reflow-react-display-layer";

import { ViewInterfacesType, viewInterfaces } from "../viewInterfaces";
import { views } from "./views";
import mainFlow from "../server/flows/main";

const transport = new Transports.WebSocketsTransport({ port: 12345 });

renderDisplayLayer({
	element: document.getElementById("main"),
	transport,
	views,
});
