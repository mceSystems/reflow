import { Flow } from "@mcesystems/reflow";

import { ViewInterfacesType } from "../viewInterfaces";

const sleep = (ms) => {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve();
		}, ms);
	})
}

const childFlow = <Flow<ViewInterfacesType, { themes: object }>>(async ({ view, views }) => {

	let currentTheme = 'blue';

	for(let i  = 0; i < 3; i++) {
		console.log(`Another Simple flow`);
		view(0, views.AnimationTester, {
			theme: currentTheme,
			prop1: 'childFlow',
			prop2: 'childFlow2',
		}, undefined, {
			singletonView: true,
		});
		await sleep(1000);
	}
});


const simpleFlow = <Flow<ViewInterfacesType, { themes: object }>>(async ({ view, views, flow }) => {

	let currentTheme = 'red';

	const createView = () => {
		return view(0, views.AnimationTester, {
			theme: currentTheme,
			prop1: 'parentFlow',
		}, undefined, {
			singletonView: true,
			resetInput: true,
		});
	}

	while(true) {
		for(let i  = 0; i < 3; i++) {
			console.log(`Simple flow`);
			
			createView();
	
			await sleep(1000);
		}
	
		await flow(childFlow);
	}

	
});

export default <Flow<ViewInterfacesType>>(async ({ flow }) => {

	await flow(simpleFlow);
	
	// awaiting a never-ending promise to hang the flow
	await new Promise(() => { });
});

