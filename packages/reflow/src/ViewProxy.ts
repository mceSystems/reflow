import { ViewInterface, ViewsMapInterface } from "./View";

export type PartialViewInterfaceInput<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap]> = {
	[U in keyof T["input"]]?: T["input"][U]
};

export type ViewInterfaceEvents<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap]> = keyof T["events"];
export type ViewInterfaceEventData<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap], U extends ViewInterfaceEvents<ViewsMap, T>> = T["events"][U];
export type ViewInterfaceEventCallback<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap], U extends ViewInterfaceEvents<ViewsMap, T>> = (data: ViewInterfaceEventData<ViewsMap, T, U>) => void;
export type GlobalEventListenerCallback<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap], U extends ViewInterfaceEvents<ViewsMap, T>> = (name: U, data: ViewInterfaceEventData<ViewsMap, T, U>) => void


export type ViewOnUpdateCallback<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap]> = (input: PartialViewInterfaceInput<ViewsMap, T>) => void;
export type ViewOnRemoveCallback = () => void;

export class ViewProxy<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap]> extends Promise<T["output"]> {
	private doneCalled = false;
	private doneCallValue: T["output"];
	private removed: boolean = false;
	private eventListeners: {
		[U in ViewInterfaceEvents<ViewsMap, T>]?: Array<ViewInterfaceEventCallback<ViewsMap, T, U>>
	} = {};
	private globalEventListeners: Array<GlobalEventListenerCallback<ViewsMap, T, ViewInterfaceEvents<ViewsMap, T>>> = [];
	private resolve: (output: T["output"]) => void;
	private reject: (output: Error) => void = (output) => { };
	private onUpdate: ViewOnUpdateCallback<ViewsMap, T> = (input) => { };
	private onRemove: ViewOnRemoveCallback = () => { };

	constructor(executor: (resolve: (value: T["output"] | PromiseLike<T["output"]>) => void, reject: () => void) => ViewProxy<ViewsMap, T> | null, onUpdate: ViewOnUpdateCallback<ViewsMap, T>, onRemove: ViewOnRemoveCallback) {
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
		for (const listener of this.globalEventListeners) {
			listener(eventName, data);
		}
		if (!this.eventListeners[eventName]) {
			return;
		}
		for (const listener of this.eventListeners[eventName]) {
			listener(data);
		}
	}
	addGlobalEventListener<U extends ViewInterfaceEvents<ViewsMap, T>>(listener: GlobalEventListenerCallback<ViewsMap, T, U>): ViewProxy<ViewsMap, T> {
		if (this.removed) {
			return;
		}
		this.globalEventListeners.push(listener);
		return this
	}
	removeGlobalEventListener<U extends ViewInterfaceEvents<ViewsMap, T>>(listener?: GlobalEventListenerCallback<ViewsMap, T, U>): ViewProxy<ViewsMap, T> {
		if (!listener) {
			this.globalEventListeners.splice(0);
		} else {
			const index = this.globalEventListeners.indexOf(listener);
			if (-1 !== index) {
				this.globalEventListeners.splice(index, 1);
			}
		}
		return this
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
	off<U extends ViewInterfaceEvents<ViewsMap, T>>(eventName: U, listener?: ViewInterfaceEventCallback<ViewsMap, T, U>): ViewProxy<ViewsMap, T> {
		if (this.eventListeners[eventName]) {
			if (listener === undefined) {
				this.eventListeners[eventName] = undefined;
			} else {
				const index = this.eventListeners[eventName].findIndex((l) => l === listener);
				this.eventListeners[eventName].splice(index, 1);
			}
		}
		return this;
	}
	/**
	 * If a listener is passed the listener will invoke with the event data
	 * The promise will resolve with the event data
	 */
	async once<U extends ViewInterfaceEvents<ViewsMap, T>>(eventName: U, listener?: ViewInterfaceEventCallback<ViewsMap, T, U>): Promise<ViewInterfaceEventData<ViewsMap, T, U>> {
		return new Promise((res) => {
			const _listener = (data: ViewInterfaceEventCallback<ViewsMap, T, U>) => {
				if (listener) {
					listener(data);
					this.off(eventName, _listener);
				}
				res(data)
			}
			this.on(eventName, _listener);
		})
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
