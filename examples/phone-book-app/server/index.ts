import { Transports, Reflow } from "@mcesystems/reflow";
import { ViewInterfacesType, viewInterfaces } from "../viewInterfaces";
import mainFlow from "./flows/main";
import { createServer } from 'http'

const server = createServer();
server.listen(12345);

const transport = new Transports.WebSocketsTransport({}, server);
const transportSecond = new Transports.WebSocketsTransport({ path: "/second" }, server);
const transportStandalone = new Transports.WebSocketsTransport({ port: 12346 });

const reflow = new Reflow<ViewInterfacesType>({
	transport,
	views: viewInterfaces,
});

reflow.start(mainFlow)

const reflowSecond = new Reflow<ViewInterfacesType>({
	transport: transportSecond,
	views: viewInterfaces,
});

reflowSecond.start(mainFlow)

const reflowStandalone = new Reflow<ViewInterfacesType>({
	transport: transportStandalone,
	views: viewInterfaces,
});

reflowStandalone.start(mainFlow)