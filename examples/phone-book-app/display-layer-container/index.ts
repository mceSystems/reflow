import { Transports, Reflow } from "@mcesystems/reflow";
import { renderDisplayLayer } from "@mcesystems/reflow-react-display-layer";

import { ViewInterfacesType, viewInterfaces } from "../viewInterfaces";
import { views } from "./views";
import mainFlow from "../server/flows/main";

const worker = new Worker("./worker.js");

const transport = new Transports.WebWorkerTransport({ worker });

renderDisplayLayer({
	element: document.getElementById("main"),
	transport,
	views,
});
