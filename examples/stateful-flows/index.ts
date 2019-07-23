import { Transports, Reflow, Flow, CancellationError } from "@mcesystems/reflow";

interface ChildFlowOutput {
	shouldContinue: boolean;
}

interface ChildFlowState {
	increment: number;
}

const mainFlow = <Flow<{}>>(async ({ flow }) => {
	console.log("[mainFlow] in");
	const childFlowProxy = flow(statefulFlow);
	let { shouldContinue } = await childFlowProxy;
	while (shouldContinue) {
		// calling the flow() function with childFlowProxy instead of the statefulFlow async function, 
		// retains the stat object the flow is using to increase the increment property
		({ shouldContinue } = await flow(childFlowProxy))
	}
});

const statefulFlow = <Flow<{}, void, ChildFlowOutput, ChildFlowState>>(async ({ state }) => {
	if(undefined === state.increment){
		state.increment = 0;
	} else {
		state.increment++;
	}
	console.log(`[statefulFlow] increment=${state.increment}`)
	return {
		shouldContinue: state.increment < 10
	}
});

const reflow = new Reflow<{}>({
	transport: new Transports.InProcTransport({}),
	views: {},
});

reflow.start(mainFlow);
