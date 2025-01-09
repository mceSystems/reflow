import { Transports, Reflow, Flow, CancellationError } from "@mcesystems/reflow";

const sleep = ms => new Promise(r => setTimeout(r, ms));

const mainFlow = <Flow<{}>>(async ({ flow }) => {
	console.log("[mainFlow] in");
	const cf = flow(canceledFlow);
	console.log("[mainFlow] called canceledFlow, going to sleep");
	await sleep(1000);
	console.log("[mainFlow] canceling canceledFlow");
	cf.cancel();

	try {
		await cf;
	} catch (e) {
		// canceled flows are rejected with a CancellationError
		console.log(`[mainFlow] was canceledFlow canceled? ${e instanceof CancellationError}`);
	}

	// a flow can also cancel itself
	const scf = flow(selfCancelingFlow)
	// we can catch it in 2 ways - by catching the flow rejection like we did above, or by listening to canceled event using "onCanceled()"
	scf.onCanceled(() => {
		console.log("[mainFlow] selfCancelingFlow has canceled it self");
	});
	try {
		await scf;
	} catch (e) {
		if(e instanceof CancellationError){
			console.log("[mainFlow] was also rejected with a CancellationError");
		}
	}
	console.log("[mainFlow] out");
});

const canceledFlow = <Flow<{}>>(async ({ action, onCanceled }) => {
	console.log("[canceledFlow] in");
	onCanceled(() => {
		// we can use onCanceled() to register a callback for when this flow is canceled
		console.log("[canceledFlow] we were canceled!!");
	});
	// we'll wrap the sleep with the action() function so the engine can stop this flow if needed
	await action(sleep(200));
	// this will be printed
	console.log("[canceledFlow] 200ms sleep passed");
	await action(sleep(1500));
	// this line will never be printed, as the flow was canceled before the 1500ms sleep was resolved
	// you can play around with the sleep timeout to see that any value below ~800ms actually print the "out" message
	console.log("[canceledFlow] out");
});

const selfCancelingFlow = <Flow<{}>>(async ({ action, onCanceled, cancel }) => {
	console.log("[selfCancelingFlow] in");
	// a flow can also cancel itself
	await action(sleep(1000));
	cancel();
	console.log("[selfCancelingFlow] out");
});


const reflow = new Reflow<{}>({
	transport: new Transports.InProcTransport({}),
	views: {},
});

reflow.start(mainFlow);
