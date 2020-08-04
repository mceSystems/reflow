import { Transports, Reflow } from "@mcesystems/reflow";
import { ViewInterfacesType, viewInterfaces } from "../viewInterfaces";
import mainFlow from "./flows/main";

export const transport = new Transports.WebWorkerTransport({});

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
