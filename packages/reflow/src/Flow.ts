
import { FlowToolkit } from "./index";
import { ViewsMapInterface } from "./View";

export class ActionPromise<T> extends Promise<T> {
	onCanceled: (cb: () => void) => ActionPromise<T>;
}

export type FlowEventsDescriptor = object;
export type FlowEventListener<Events extends FlowEventsDescriptor, T extends keyof Events> = (data: Events[T]) => void;
export type FlowEventsEmitter<Events extends FlowEventsDescriptor> = <T extends keyof Events>(eventName: T, data: Events[T]) => void;
export type FlowEventRegisterer<Events extends FlowEventsDescriptor> = <T extends keyof Events>(eventName: T, listener?: FlowEventListener<Events, T>) => Promise<Events[T]>;
export type FlowEventRemover<Events extends FlowEventsDescriptor> = <T extends keyof Events>(eventName: T, listener?: FlowEventListener<Events, T>) => void;
export type FlowAction = <T>(action: Promise<T>) => ActionPromise<T>;

export type Flow<ViewsMap extends ViewsMapInterface, Input extends any = void, Output extends any = void, State extends object = {}, Notifications extends FlowEventsDescriptor = {}, Events extends FlowEventsDescriptor = {}> =
	(toolkit: FlowToolkit<ViewsMap> & { input: Input, state: State, event: FlowEventsEmitter<Events>, on: FlowEventRegisterer<Notifications>, off: FlowEventRemover<Notifications>, action: FlowAction, onCanceled: (cb: () => void) => void, cancel: () => void }) => Promise<Output>;

export class CancellationError { }

export interface FlowOptions {
	autoStart: boolean;
}

let tmpResolve = null;
let tmpReject = null;
export class FlowProxy<ViewsMap extends ViewsMapInterface, Input extends any = void, Output extends any = void, State extends object = {}, Notifications extends FlowEventsDescriptor = {}, Events extends FlowEventsDescriptor = {}> extends Promise<Output> {
	private resolve: () => void = () => { };
	private reject: (err?) => void = () => { };
	private notificationListeners: { [T in keyof Notifications]?: Array<FlowEventListener<Notifications, T>> } = {};
	private eventListeners: { [T in keyof Events]?: Array<FlowEventListener<Events, T>> } = {};
	private cancellationPromise: Promise<CancellationError>;
	private cancellationPromiseEmitters: Array<() => void> = [];
	private doCancelFlow: () => void;
	private childFlows: Array<FlowProxy<ViewsMap, any, any, any, any, any>> = [];
	public flowProcedure: Flow<ViewsMap, Input, Output>;
	public toolkit: FlowToolkit<ViewsMap>;
	public state: State;
	public input: Input;
	constructor(executor: (resolve: () => void, reject: () => void) => FlowProxy<ViewsMap, Input, Output, State, Notifications, Events> | null, flowProc: Flow<ViewsMap, Input, Output, State>, toolkit: FlowToolkit<ViewsMap>, input?: Input, state?: State, options?: FlowOptions) {
		super(executor ? executor : (resolve, reject) => {
			tmpResolve = resolve;
			tmpReject = reject;
		});
		let main = false;
		if (tmpResolve && tmpReject) {
			main = true;
			// this is a hack, counting on javascript runtime being single threaded
			// super is called synchronously, so two FlowProxy constructors can't be called together, affecting the resolve member of on another through the global tmpResolve variable
			this.resolve = tmpResolve.bind(this);
			this.reject = tmpReject.bind(this);
			tmpResolve = null;
			tmpReject = null;
		}

		this.flowProcedure = flowProc;
		this.toolkit = toolkit;
		this.state = state;
		this.input = input;

		this.event = this.event.bind(this);
		this.action = this.action.bind(this);
		this.onNotification = this.onNotification.bind(this);
		this.offNotification = this.offNotification.bind(this);
		this.notify = this.notify.bind(this);
		this.cancel = this.cancel.bind(this);
		this.onCanceled = this.onCanceled.bind(this);

		if (main) {
			this.hookFlowFunction();
			this.cancellationPromise = new Promise((resolve) => {
				this.doCancelFlow = () => {
					for (const cb of this.cancellationPromiseEmitters) {
						cb();
					}
					// cancel all child flows
					for (const childFlow of this.childFlows) {
						childFlow.cancel();
					}
					resolve(new CancellationError());
				};
			});
			const { autoStart = true } = options || {};
			if (autoStart) {
				this.executeFlowProc();
			}
		}
	}
	private executeFlowProc() {
		return this.flowProcedure(Object.assign({}, this.toolkit, {
			input: this.input,
			state: this.state,
			event: this.event,
			on: this.onNotification,
			off: this.offNotification,
			action: this.action,
			cancel: this.cancel,
			onCanceled: this.onCanceled,
		})).then(this.resolve, this.reject);
	}
	private hookFlowFunction() {
		// hook on the toolkit flow() function so we can track child processes, and cancel them when this instance is canceled
		const originalFlowFn = this.toolkit.flow;
		this.toolkit.flow = (flow, input?, viewParent?, options?) => {
			const childFlowProxy = originalFlowFn(flow, input, viewParent, options);
			this.childFlows.push(childFlowProxy);
			childFlowProxy.catch(() => { }).then(() => {
				const idx = this.childFlows.indexOf(childFlowProxy);
				if (-1 === idx) {
					return;
				}
				this.childFlows.splice(idx, 1);
			});
			return childFlowProxy;
		};
	}
	private dispatchEvent(listenersMap: object, eventName: string | number | symbol, data: any) {
		if (!listenersMap[eventName]) {
			return;
		}

		// Making a copy since listeners might mess with the map (see @registerEventListener) which might mess up our iteration
		const listeners = [...listenersMap[eventName]];
		for (const listener of listeners) {
			listener(data);
		}
	}
	private registerEventListener<T extends FlowEventsDescriptor, U extends keyof T>(listenersMap: object, eventName: string | number | symbol, listener?: (data) => void): Promise<T[U]> {
		if (!listenersMap[eventName]) {
			listenersMap[eventName] = [];
		}
		if (!listener) {
			return new Promise((resolve) => {
				const promiseListener = (data) => {
					this.removeEventListener(listenersMap, eventName, promiseListener);
					resolve(data);
				};
				this.registerEventListener(listenersMap, eventName, promiseListener);
			});
		}
		listenersMap[eventName].push(listener);
	}
	private removeEventListener(listenersMap: object, eventName: string | number | symbol, listener?: (data) => void) {
		if (!listenersMap[eventName]) {
			return;
		}
		if (!listener) {
			delete listenersMap[eventName];
			return;
		}

		const listeners = [...listenersMap[eventName]];
		for (const i in listeners) {
			if (listener === listenersMap[eventName][i]) {
				listenersMap[eventName].splice(i, 1);
			}
		}
	}
	private action<T>(action: Promise<T>): ActionPromise<T> {
		let cancellationPromiseEmitter;
		const racingPromise = <ActionPromise<T>>Promise.race([this.cancellationPromise, action]).then((res) => {
			if (cancellationPromiseEmitter) {
				const idx = this.cancellationPromiseEmitters.indexOf(cancellationPromiseEmitter);
				if (-1 !== idx) {
					this.cancellationPromiseEmitters.splice(idx, 1);
				}
				cancellationPromiseEmitter = null;
			}
			if (!(res instanceof CancellationError)) {
				return res;
			}
			// if flow was canceled return a never-ending promise;
			return new Promise(() => { });
		});

		racingPromise.onCanceled = (cb) => {
			cancellationPromiseEmitter = cb;
			this.cancellationPromiseEmitters.push(cancellationPromiseEmitter);
			return racingPromise;
		};

		return racingPromise;
	}
	start() {
		this.executeFlowProc();
	}
	notify<T extends keyof Notifications>(eventName: T, data: Notifications[T]): void {
		this.dispatchEvent(this.notificationListeners, eventName, data);
	}
	onNotification<T extends keyof Notifications>(eventName: T, listener?: FlowEventListener<Notifications, T>): Promise<Notifications[T]> {
		return this.registerEventListener<Notifications, T>(this.notificationListeners, eventName, listener);
	}
	offNotification<T extends keyof Notifications>(eventName: T, listener: FlowEventListener<Notifications, T>) {
		this.removeEventListener(this.notificationListeners, eventName, listener);
	}
	event<T extends keyof Events>(eventName: T, data: Events[T]) {
		this.dispatchEvent(this.eventListeners, eventName, data);
	}
	on<T extends keyof Events>(eventName: T, listener?: FlowEventListener<Events, T>): Promise<Events[T]> {
		return this.registerEventListener<Events, T>(this.eventListeners, eventName, listener);
	}
	off<T extends keyof Events>(eventName: T, listener: FlowEventListener<Events, T>) {
		this.removeEventListener(this.eventListeners, eventName, listener);
	}
	cancel() {
		this.doCancelFlow();
		this.reject(new CancellationError());
	}
	onCanceled(cb: () => void) {
		this.cancellationPromiseEmitters.push(cb);
	}
}
