import { Transports, Reflow, Flow } from "@mcesystems/reflow";

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Flow routing is a feature used to arrange the flow in smaller logical parts, 
// and mount "back points" - logical anchors which the flow can return back to
// and re-run the steps following it.
// When using this feature:
// 1. The flow runs each function registered with step(), on-by-one (awaiting in between, so each step runs after the other)
// 2. Calling backPoint() between steps, marks the spot as a place that the flow can return to, and run the following steps
// 3. Calling back() from within the flow, or FlowProxy.back() from outside, routes the flow to the last back-point. if no back-point found - the flow returns

const mainFlow = <Flow<{}>>(async ({ step, back, backPoint, flow }) => {
	console.log("[mainFlow] in");
	let counter = 0;
	backPoint();
	// when calling the step() function, we tell the engine to 
	// register this step in the "flow route"
	step(async () => {
		console.log("[mainFlow] 1st step");
		await sleep(1000);
	});
	backPoint();
	step(async () => {
		console.log("[mainFlow] 2nd step");
		await sleep(2000);
	});
	await step(async () => {
		console.log(`[mainFlow] 3rd step. counter=${++counter}`);
		if (2 === counter) {
			return;
		}
		// back will return to the first back-point (not the closest previous one, but the one before- so we're not stuck in a loop)
		back();
	});
	const childFlowProxy = flow(childFlow);
	await sleep(1500);
	console.log("[mainFlow] calling childFlow's back()");
	childFlowProxy.back();
	await childFlowProxy;

	await flow(backPointIdentifierFlow);

	console.log("[mainFlow] out");
});

const childFlow = <Flow<{}>>(async ({ step, back, backPoint }) => {
	console.log("[childFlow] in");
	backPoint();
	step(async () => {
		console.log("[childFlow] 1st step");
		await sleep(1000);
	});
	backPoint();
	step(async () => {
		console.log("[childFlow] 2nd step");
		await sleep(2000);
	});
	await step(async () => {
		console.log("[childFlow] 3rd step");
	});
	console.log("[childFlow] out");
});

const backPointIdentifierFlow = <Flow<{}>>(async ({ step, back, backPoint }) => {
	console.log("[backPointIdentifierFlow] in");
	// back points can have identifiers as well
	// so back() can return to a specific back-point if needed
	backPoint("start");
	let firstRun = true;
	step(async () => {
		console.log("[backPointIdentifierFlow] 1st step");
		await sleep(1000);
	});
	backPoint();
	step(async () => {
		console.log("[backPointIdentifierFlow] 2nd step");
		await sleep(1000);
	});
	backPoint();
	step(async () => {
		console.log("[backPointIdentifierFlow] 3rd step");
	});
	backPoint();
	step(async () => {
		console.log("[backPointIdentifierFlow] 4th step");
	});
	backPoint();
	step(async () => {
		console.log("[backPointIdentifierFlow] 5th step");
	});
	backPoint();
	step(async () => {
		console.log("[backPointIdentifierFlow] 6th step");
	});
	backPoint();
	await step(async () => {
		console.log("[backPointIdentifierFlow] 7th step");
		if(firstRun){
			firstRun = false;
			// returning to a specific back-point instead of the last one
			back("start");
			return;
		}
	});
	console.log("[backPointIdentifierFlow] out");
});


const reflow = new Reflow<{}>({
	transport: new Transports.InProcTransport({}),
	views: {},
});

reflow.start(mainFlow).then(() => {
	console.log("finished running mainFlow");
});
