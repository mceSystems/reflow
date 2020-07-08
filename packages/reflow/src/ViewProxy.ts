import { ViewInterface, ViewsMapInterface } from "./View";

export type PartialViewInterfaceInput<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap]> = {
	[U in keyof T["input"]]?: T["input"][U]
};

export type ViewInterfaceEvents<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap]> = keyof T["events"];
export type ViewInterfaceEventData<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap], U extends ViewInterfaceEvents<ViewsMap, T>> = T["events"][U];
export type ViewInterfaceEventCallback<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap], U extends ViewInterfaceEvents<ViewsMap, T>> = (data: ViewInterfaceEventData<ViewsMap, T, U>) => void;

export type ViewInterfaceFunctions<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap]> = keyof T["functions"];
export type ViewInterfaceFunctionsReturnType<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap], U extends ViewInterfaceFunctions<ViewsMap, T>> = ReturnType<T["functions"][U]>;
export type ViewInterfaceFunctionsArguments<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap], U extends ViewInterfaceFunctions<ViewsMap, T>> = Parameters<T["functions"][U]>[0];

export type ViewOnUpdateCallback<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap]> = (input: PartialViewInterfaceInput<ViewsMap, T>) => void;
export type ViewOnRemoveCallback = () => void;

export class ViewProxy<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap]> extends Promise<T["output"]> {
	private doneCalled = false;
	private doneCallValue: T["output"];
	private removed: boolean = false;
	private eventListeners: {
		[U in ViewInterfaceEvents<ViewsMap, T>]?: Array<ViewInterfaceEventCallback<ViewsMap, T, U>>
	};
	private functionsListeners: {
		[U in ViewInterfaceFunctions<ViewsMap, T>]?: (args: ViewInterfaceFunctionsArguments<ViewsMap, T, U>) => ViewInterfaceFunctionsReturnType<ViewsMap, T, U>;
	};
	private resolve: (output: T["output"]) => void;
	private reject: (output: Error) => void = (output) => { };
	private onUpdate: ViewOnUpdateCallback<ViewsMap, T> = (input) => { };
	private onRemove: ViewOnRemoveCallback = () => { };

	constructor(executor: (resolve: () => void, reject: () => void) => ViewProxy<ViewsMap, T> | null, onUpdate: ViewOnUpdateCallback<ViewsMap, T>, onRemove: ViewOnRemoveCallback) {
		super(executor ? executor : (resolve) => {
			setTimeout(() => {
				this.resolve = resolve;
				// technically, because we're assigning this.resolve in a timeout, ViewProxy.done can be called synchronously before the timer is done.
				// in such case, ViewProxy.done flags it was called, and keep the output value - we'll immediately resolve
				if (this.doneCalled) {
					resolve(this.doneCallValue);
				}
			});
		});
		this.onUpdate = onUpdate || this.onUpdate;
		this.onRemove = onRemove || this.onRemove;
		this.eventListeners = {};
		this.functionsListeners = {};
	}
	done(output: T["output"]) {
		if (!this.resolve) {
			this.doneCalled = true;
			this.doneCallValue = output;
			return;
		}
		this.resolve(output);
	}
	event<U extends ViewInterfaceEvents<ViewsMap, T>>(eventName: U, data: ViewInterfaceEventData<ViewsMap, T, U>) {
		if (this.removed) {
			return;
		}
		if (!this.eventListeners[eventName]) {
			return;
		}
		for (const listener of this.eventListeners[eventName]) {
			listener(data);
		}
	}
	on<U extends ViewInterfaceEvents<ViewsMap, T>>(eventName: U, listener: ViewInterfaceEventCallback<ViewsMap, T, U>): ViewProxy<ViewsMap, T> {
		if (this.removed) {
			return;
		}
		if (!this.eventListeners[eventName]) {
			this.eventListeners[eventName] = [];
		}
		this.eventListeners[eventName].push(listener);
		return this;
	}
	call<U extends ViewInterfaceFunctions<ViewsMap, T>>(functionName: U, data: ViewInterfaceFunctionsArguments<ViewsMap, T, U>): ViewInterfaceFunctionsReturnType<ViewsMap, T, U> | void {
		if (this.removed) {
			return;
		}
		const implementations = this.functionsListeners[functionName];
		if (!implementations) {
			return;
		}
		return implementations(data);
	}
	implement<U extends ViewInterfaceFunctions<ViewsMap, T>>(functionName: U, implementation: (args: ViewInterfaceFunctionsArguments<ViewsMap, T, U>) => ViewInterfaceFunctionsReturnType<ViewsMap, T, U>) {
		if (this.removed) {
			return;
		}
		this.functionsListeners[functionName] = implementation;
		return this;
	}
	update(params: PartialViewInterfaceInput<ViewsMap, T>) {
		if (this.removed) {
			return;
		}
		this.onUpdate(params);
	}
	remove() {
		this.removed = true;
		this.onRemove();
		// when a view is removed, resolve the promise.
		this.done(undefined);
	}
}
