import { ReflowTransport } from "../ReflowTransport";
import { ReducedViewTree } from "../../Reflow";
import { ViewInterface, ViewsMapInterface } from "../../View";


export default class InProcTransport<ViewerParameters = {}> extends ReflowTransport<ViewerParameters> {
	initializeAsEngine() {
		return Promise.resolve();
	}
	initializeAsDisplay() {
		return new Promise<InProcTransport<ViewerParameters>>((resolve) => {
			this.sendViewSync();
			resolve(this);
		});
	}
	sendViewTree(tree: ReducedViewTree<ViewsMapInterface>) {
		for (const listener of this.viewStackUpdateListeners) {
			listener(JSON.parse(JSON.stringify(tree)));
		}
	}
	sendViewEvent<T extends ViewInterface, U extends keyof T["events"]>(uid: string, eventName: U, eventData: T["events"][U]): void {
		for (const listener of this.viewEventListeners) {
			listener(uid, eventName, eventData);
		}
	}
	sendViewFunction<T extends ViewInterface<{}, {}, {}, any>, U extends keyof T["functions"]>(uid: string, functionName: U, functionData: T["functions"][U]): Promise<ReturnType<T["functions"][U]> | undefined>{
		return new Promise<ReturnType<T["functions"][U]>>((resolve) => {
			let finish = false;
			for (const listener of this.viewFunctionListeners) {
				const result = listener(uid, functionName, functionData);
				if (result) {
				finish = true;
				resolve(result);
			}
		}
		if (!finish) {
			resolve();
			}
		});
	}
	sendViewDone<T extends ViewInterface>(uid: string, output: T["output"]): void {
		for (const listener of this.viewDoneListeners) {
			listener(uid, output);
		}
	}
	sendViewerParameters(viewerParams: ViewerParameters): void {
		for (const listener of this.viewerParametersListeners) {
			listener(viewerParams);
		}
	}
	sendViewSync() {
		for (const listener of this.viewSyncListeners) {
			listener();
		}
	}
}
