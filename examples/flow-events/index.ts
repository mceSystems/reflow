import { Transports, Reflow, Flow } from "@mcesystems/reflow";

const sleep = ms => new Promise(r => setTimeout(r, ms));

// To use flow events, we'll have to declare the event type when declaring the flow
interface ChildFlowEvents {
	myEvent: {
		myData: string;
	};
	someOtherEvent: {
		moreData: number;
	};
};
interface ChildFlowNotifications {
	myNotification: {
		notifiedData: boolean
	}
}

const parentFlow = <Flow<{}>>(async ({ flow }) => {
	console.log("[parentFlow] in");
	const child = flow(childFlow);
	child.on("myEvent", ({ myData }) => {
		console.log(`[parentFlow] got myEvent with myData=${myData}`);
	});
	// take under consideration that FlowProxy.on() is a promise, soa a one-time event listener can await
	const { moreData } = await child.on("someOtherEvent");
	console.log(`[parentFlow] got someOtherEvent with moreData=${moreData}`);

	// now lets notify the child flow
	child.notify("myNotification", {
		notifiedData: true,
	});
});

const childFlow = <Flow<{}, void, void, {}, ChildFlowNotifications, ChildFlowEvents>>(async ({ event, on }) => {
	on("myNotification", ({ notifiedData }) => {
		console.log(`[childFlow] got myNotification with notifiedData=${notifiedData}`);
	})
	await sleep(1000);
	event("myEvent", {
		myData: "Hello!"
	});

	await sleep(1000);

	event("someOtherEvent", {
		moreData: 42,
	});

});


const reflow = new Reflow<{}>({
	transport: new Transports.InProcTransport({}),
	views: {},
});

reflow.start(parentFlow);
