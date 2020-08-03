import { Transports, Reflow } from "@mcesystems/reflow";
import { ViewInterfacesType, viewInterfaces } from "../viewInterfaces";
import mainFlow from "./flows/main";

const transport = new Transports.WebWorkerTransport({});

const reflow = new Reflow<ViewInterfacesType>({
	transport,
	views: viewInterfaces,
});
reflow.start(mainFlow)