import { Transports } from "@mcesystems/reflow";
import { renderDisplayLayer } from "@mcesystems/reflow-react-display-layer";

import { views } from "./views";

const transport = new Transports.WebSocketsTransport({ port: 12345 });

renderDisplayLayer({
	element: document.getElementById("main"),
	transport,
	views,
});
