import { Transports, Reflow } from "@mcesystems/reflow";
import { ViewInterfacesType, viewInterfaces } from "../viewInterfaces";
import mainFlow from "./flows/main";
import { createServer } from 'http'

export const transport = new Transports.WebWorkerTransport({ connection: new BroadcastChannel("main_service") });

const testHandler = (data) => {
  console.log(data);
  transport.removeWorkerEventListener("test", testHandler);
};

transport.addWorkerEventListener("test", testHandler);


const reflow = new Reflow<ViewInterfacesType>({
	transport,
	views: viewInterfaces,
});

reflow.start(mainFlow)
