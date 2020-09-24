import { Transports, Reflow, Flow } from "@mcesystems/reflow";

interface ExtrnalEvents {
	myExternalEvent: {
		data: string;
	};
	otherExternalEvent: {
		data: string;
	}
}

const mainFlow = <Flow<{}, void, void, {}, {}, {}, ExtrnalEvents>>(async ({externalEvent}) => {
	// this should trigger a console.log
	externalEvent("myExternalEvent", {
		data: "myExternalEventData"
	});
	// this should trigger 2 console.log
	externalEvent("otherExternalEvent", {
		data: "otherExternalEvent"
	})
	// this should not trigger a console.log
	externalEvent("otherExternalEvent", {
		data: "otherExternalEvent"
	})
});

const reflow = new Reflow<{}>({
	transport: new Transports.InProcTransport({}),
	views: {},
});

const l1 = ({ data }) => {
	console.log(data); //"myExternalEventData"
	reflow.removeEventListener("myExternalEvent", l1);
}

const l2 = ({ data }) => {
	console.log(data); //"otherExternalEvent", "data"
	reflow.removeEventListener("otherExternalEvent");
}

const l3 = ({ data }) => {
	console.log(data); //"otherExternalEvent", "data"
}

reflow.addEventListener("myExternalEvent", l1);
reflow.addEventListener("otherExternalEvent", l2);
reflow.addEventListener("otherExternalEvent", l3);

reflow.start(mainFlow);
