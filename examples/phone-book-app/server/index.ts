import { Transports, Reflow } from "@mcesystems/reflow";
import { ViewInterfacesType, viewInterfaces } from "../viewInterfaces";
import mainFlow from "./flows/main";

const transport = new Transports.WebSocketsTransport({ port: 12345 });

const reflow = new Reflow<ViewInterfacesType>({
	transport,
	views: viewInterfaces,
});
reflow.start(mainFlow)