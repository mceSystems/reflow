import { Transports, Reflow } from "@mcesystems/reflow";
import { renderDisplayLayer } from "@mcesystems/reflow-react-display-layer";

import { ViewInterfacesType, viewInterfaces } from "../viewInterfaces";
import { views } from "./views";
import mainFlow from "../server/flows/main";

const transport = new Transports.WebSocketsTransport({ port: 12345 });
const transportSecond = new Transports.WebSocketsTransport({ port: 12345, path: "/second" });
const transportStandalone = new Transports.WebSocketsTransport({ port: 12346 });

renderDisplayLayer({
	element: document.getElementById("main"),
	transport,
	views,
});

renderDisplayLayer({
	element: document.getElementById("second"),
	transport: transportSecond,
	views,
});

renderDisplayLayer({
	element: document.getElementById("standalone"),
	transport: transportStandalone,
	views,
});
