import { Transports, Reflow } from "@mcesystems/reflow";
import { renderDisplayLayer } from "@mcesystems/reflow-react-display-layer";
import { views } from "./views";


const transport = new Transports.WebWorkerTransport({ connection: new BroadcastChannel("main_service") });

const testHandler = (data) => {
	console.log(data);
	transport.removeWorkerEventListener("test", testHandler);
};

navigator.serviceWorker.register('./worker.js').then(() => {
	transport.addWorkerEventListener("test", testHandler);
	
	
	renderDisplayLayer({
		element: document.getElementById("main"),
		transport,
		views,
	});
	
	transport.emitWorkerEvent("test", "hello from display test"); // should only get one message
	transport.emitWorkerEvent("test", "hello from display test");
	transport.emitWorkerEvent("test", "hello from display test");
})
