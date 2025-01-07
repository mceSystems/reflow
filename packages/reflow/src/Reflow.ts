import { FlowProxy, Flow, CancellationError, FlowOptions } from "./Flow";
import { ViewProxy } from "./ViewProxy";
import { ViewOptions, ViewsMapInterface } from "./View";
import { v4 } from "uuid";
import { ReflowTransport } from "./Transports";

export interface Strings {
	[locale: string]: {
		[key: string]: string;
	};
}
export class TranslateableString extends String {
	public __reflowOriginalString: string = "";
	public __reflowTranslateable: boolean = true;
	public __reflowTemplateDictionary: { [token: string]: any } = {};
	public toJSON: (original: string) => string;
	constructor(...args) {
		super(...args);
	}
}

export interface FlowToolkit<ViewsMap extends ViewsMapInterface, ViewerParameters = {}> {
	/**
	 * Start new flow
	 */
	flow: <
		Input extends any,
		Output extends any,
		State extends object,
		Notifications extends object,
		Events extends object,
		ExternalEvents extends object,
	// tslint:disable-next-line: max-line-length
	>(flow: Flow<ViewsMap, Input, Output, State, Notifications, Events, ExternalEvents> | FlowProxy<ViewsMap, Input, Output, State, Notifications, Events, ExternalEvents>, input?: Input, viewParent?: ViewProxy<ViewsMap, ViewsMap[keyof ViewsMap]> | null, options?: FlowOptions) => FlowProxy<ViewsMap, Input, Output, State, Notifications, Events, ExternalEvents>;
	/**
	 * Start new view
	 */
	view: <T extends ViewsMap[keyof ViewsMap]>(layer: number, type: T, input?: T["input"], viewParent?: ViewProxy<ViewsMap, ViewsMap[keyof ViewsMap]>, options?: ViewOptions) => ViewProxy<ViewsMap, T>
	/**
	 * Views dictionary to use with the view function
	 */
	views: ViewsMap;
	/**
	 * Update viewer parameters
	 */
	viewerParameters: (params: ViewerParameters) => void;
	/**
	 * Embed the view tree from the given transport in the given viewParent
	 * If no viewParent is given, embeds in the flows' view parent
	 * 
	 */
	pipeDisplayLayer: (transport: ReflowTransport<ViewerParameters>, viewParent?: ViewProxy<ViewsMap, ViewsMap[keyof ViewsMap]> | null) => Promise<{ remove: () => void }>;
	/**
	 * Translatable string
	 */
	tx: (str: string, templateDictionary?: TranslateableString["__reflowTemplateDictionary"]) => string;
	/**
	 * Update strings dictionary
	 */
	strings: (strings: Strings) => void;
	/**
	 * Set language
	 */
	language: (language: string, fallbackLanguages?: string[]) => void;
	/**
	 * Set fallback languages in case a key isn't found in the set language
	 */
	fallbackLanguages: (language: string[]) => void;
	/**
	 * Send external events
	 */
	externalEvent: (eventName: string | number | symbol, data: any) => void;
}

type ExternalEventListener = (data: any) => void

export interface ReflowOptions<ViewsMap extends ViewsMapInterface, ViewerParameters = {}> {
	transport: ReflowTransport<ViewerParameters> | ReflowTransport<ViewerParameters>[];
	views: ViewsMap;
	viewerParameters?: ViewerParameters;
}

export interface ViewTreeItemBase<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap]> {
	name: string;
	uid: string;
	input?: object;
	viewProxy?: ViewProxy<ViewsMap, T>;
}

export interface ViewTreeItem<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap]> extends ViewTreeItemBase<ViewsMap, T> {
	children: Array<ViewTree<ViewsMap>>;
}
export interface ReducedViewTreeItem<ViewsMap extends ViewsMapInterface, T extends ViewsMap[keyof ViewsMap]> extends ViewTreeItemBase<ViewsMap, T> {
	children: ReducedViewTree<ViewsMap>;
}

export interface ViewTree<ViewsMap extends ViewsMapInterface> {
	views: Array<ViewTreeItem<ViewsMap, ViewsMap[keyof ViewsMap]>>;
	strings: Strings;
	done: boolean;
}

export type ReducedViewTree<ViewsMap extends ViewsMapInterface> = Array<ReducedViewTreeItem<ViewsMap, ViewsMap[keyof ViewsMap]>>;

export interface TranslationCompareHistory {
	lastTranslate: string;
	lastTranslated: string;
};

const createTranslateableString = (original: string, value: string, templateDictionary?: TranslateableString["__reflowTemplateDictionary"], toJsonHandler?: TranslateableString["toJSON"]) => {
	const translateable = new String(value) as TranslateableString;
	translateable.__reflowOriginalString = original;
	translateable.__reflowTranslateable = true;
	translateable.__reflowTemplateDictionary = templateDictionary || {};
	if (toJsonHandler) {
		translateable.toJSON = toJsonHandler;
		translateable.toString = toJsonHandler as () => string;
	} else {
		translateable.toJSON = () => original;
	}
	return translateable as unknown as string;
};


export class Reflow<ViewsMap extends ViewsMapInterface, ViewerParameters = {}> {
	private mainFlowProxy: FlowProxy<ViewsMap, any, any, any, any, any, any>;
	private started: boolean = false;
	private transport: ReflowTransport<ViewerParameters>[];
	private views: ViewsMap;
	private viewStack: Array<ViewTree<ViewsMap>> = [];
	// used for quick uid-to-viewProxy access
	private viewMap: {
		[key: string]: ViewTreeItem<ViewsMap, ViewsMap[keyof ViewsMap]>;
	};
	private viewerParameters: ViewerParameters;
	private currentLanguage: string;
	private currentFallbackLanguages: string[];
	private externalEventListeners: { [key: string]: Array<ExternalEventListener> } = {};

	constructor({ transport, views, viewerParameters }: ReflowOptions<ViewsMap, ViewerParameters>) {
		this.transport = Array.isArray(transport) ? transport : [transport];
		this.views = views;
		this.viewMap = {};
		this.currentLanguage = "";
		this.currentFallbackLanguages = [];
		this.viewerParameters = viewerParameters;
		this.transport.forEach((tp) => {
			this.setupTransportListeners(tp);
		})
	}
	private setupTransportListeners(transport: ReflowTransport<ViewerParameters>) {
		transport.onViewDone((uid, output) => {
			if (!this.viewMap[uid]) {
				return;
			}
			this.viewMap[uid].viewProxy.done(output);
		});
		transport.onViewEvent((uid, eventName, eventData) => {
			if (!this.viewMap[uid]) {
				return;
			}
			this.viewMap[uid].viewProxy.event(eventName, eventData);
		});
		transport.onSyncView(() => {
			this.updateViewerParameters(this.viewerParameters);
			this.update(transport);
		});
	}
	private translateableStringToJsonHandler(strings: Strings, original: string, history: TranslationCompareHistory, templateDictionary?: TranslateableString["__reflowTemplateDictionary"]): string {
		const dict = strings[this.currentLanguage];
		let translated = (dict || {})[original];
		if (dict && translated === history.lastTranslate) {
			return history.lastTranslated;
		}
		history.lastTranslate = translated;
		if (translated === undefined) {
			const fallbackTranslationLanguage = this.currentFallbackLanguages.find(lang => (lang in strings) && (original in strings[lang]));
			if (fallbackTranslationLanguage) {
				translated = strings[fallbackTranslationLanguage][original];
			} else {
				translated = original;
			}
		}
		if (templateDictionary && translated !== undefined) {
			translated = translated.replace(/\$\{(.*?)\}\$/g, (_, token) => {
				return templateDictionary[token];
			});
		}
		history.lastTranslated = translated;
		return translated;
	}
	private createTranslateableString(strings: Strings, original: string, value: string, templateDictionary?: TranslateableString["__reflowTemplateDictionary"]) {
		const defaultHistory: TranslationCompareHistory = {
			lastTranslate: undefined,
			lastTranslated: original,
		}
		return createTranslateableString(original, value, templateDictionary, this.translateableStringToJsonHandler.bind(this, strings, original, defaultHistory, templateDictionary));
	}
	private getViewUid(viewParent: ViewProxy<ViewsMap, ViewsMap[keyof ViewsMap]>): string {
		let viewParentUid = null;
		if (viewParent) {
			for (const uid in this.viewMap) {
				if (this.viewMap[uid].viewProxy === viewParent) {
					viewParentUid = uid;
					break;
				}
			}
		}
		return viewParentUid;
	}
	private getViewStack(viewParentUid: string): Array<ViewTree<ViewsMap>> {
		let viewStack: Array<ViewTree<ViewsMap>>;
		if (viewParentUid && viewParentUid in this.viewMap) {
			viewStack = this.viewMap[viewParentUid].children;
		} else {
			viewStack = this.viewStack;
		}
		return viewStack;
	}
	private getToolkit(flowViewStackIndex: number, viewParent: ViewProxy<ViewsMap, ViewsMap[keyof ViewsMap]>, viewParentUid: string): FlowToolkit<ViewsMap> {
		return {
			flow: this.flow.bind(this, viewParent),
			view: this.view.bind(this, flowViewStackIndex, viewParentUid),
			pipeDisplayLayer: this.pipeDisplayLayer.bind(this, flowViewStackIndex, viewParent),
			views: this.views,
			viewerParameters: this.updateViewerParameters.bind(this),
			tx: (str: string, templateDictionary?: { [token: string]: any }) => {
				const workingStack = this.getViewStack(viewParentUid);
				const flowStack = workingStack[flowViewStackIndex];
				return this.createTranslateableString(flowStack.strings, str, str, templateDictionary);
			},
			language: (language: string, fallbackLanguages?: string[]) => {
				this.currentLanguage = language;
				if (fallbackLanguages) {
					this.currentFallbackLanguages = fallbackLanguages;
				}
				this.update();
			},
			fallbackLanguages: (languages: string[]) => {
				this.currentFallbackLanguages = languages;
				this.update();
			},
			strings: (strings: Strings) => {
				const workingStack = this.getViewStack(viewParentUid);
				const flowStack = workingStack[flowViewStackIndex];
				for (const locale in strings) {
					flowStack.strings[locale] = Object.assign({}, flowStack.strings[locale], strings[locale]);
				}
			},
			externalEvent: (eventName: string | number | symbol, data: any) => {
				this.dispatchEvent(this.externalEventListeners, eventName, data);
			},
		};
	}
	private deflateViewTree(viewTree: Array<ViewTree<ViewsMap>>): ReducedViewTree<ViewsMap> {
		return (
			(JSON.parse(JSON.stringify(viewTree)) as typeof viewTree) // translate translatable strings
				.filter(n => n) // remove delete views
				// filter out items in each ViewTree that are undefined/null
				.map(n => n.views.filter(j => !!j))
				// filter out layers that are null/undefined or now, after the filter above are empty
				.filter(n => !!n || n.length > 0)
				// reduce the ViewTreeItem[][] to ViewTreeItem[]
				.reduce((a, b) => a.concat(b), [])
				// recurse through children
				.map((item) => {
					return Object.assign({}, item, { children: this.deflateViewTree(item.children), viewProxy: undefined });
				})
		);
	}

	private inflateViewTree(viewTree: ReducedViewTree<ViewsMapInterface>): Array<ViewTree<ViewsMap>> {
		return (
			viewTree
				.map(n => ({
					done: false,
					strings: {},
					views: [
						Object.assign({}, n, {
							children: this.inflateViewTree(n.children),
							viewProxy: new ViewProxy(null, () => { }, () => { }), // virtual ViewProxy - used to listen to done and event calls
						})
					],
				}))
		);
	}

	private updateViewerParameters(viewerParameters: ViewerParameters) {
		this.viewerParameters = viewerParameters;
		this.transport.forEach((tp) => tp.sendViewerParameters(viewerParameters));
	}
	private update(transport?: ReflowTransport<ViewerParameters>) {
		const reducedStack = this.deflateViewTree(this.viewStack);
		if (transport) {
			transport.sendViewTree(reducedStack);
			return;
		}
		this.transport.forEach((tp) => tp.sendViewTree(reducedStack));
	}
	private view<T extends ViewsMap[keyof ViewsMap]>(flowViewStackIndex: number, viewParentUid: string | null, layer: number, type: T, input?: T["input"], viewParent?: ViewProxy<ViewsMap, ViewsMap[keyof ViewsMap]>, options?: ViewOptions): ViewProxy<ViewsMap, T> {
		if (viewParent) {
			viewParentUid = this.getViewUid(viewParent);
		}

		let viewName: string;
		for (const name in this.views) {
			if (<ViewsMap[keyof ViewsMap]>type === this.views[name]) {
				viewName = name;
				break;
			}
		}
		if (!viewName) {
			throw new Error(`Couldn't find view in provided views map`);
		}
		if (viewParentUid && !this.viewMap[viewParentUid]) {
			throw new Error(`Provided viewParent is invalid (was it removed?)`);
		}
		const workingStack = this.getViewStack(viewParentUid);
		if (!workingStack[flowViewStackIndex]) {
			workingStack[flowViewStackIndex] = {
				strings: {},
				views: [],
				done: false,
			};
		}
		if (workingStack[flowViewStackIndex].done) {
			// done flow stack - block viewing new views
			return;
		}
		const workingTree: ViewTree<ViewsMap> = workingStack[flowViewStackIndex];

		if(options?.singletonView) {
			let findSameView = workingTree.views.find((f) => f.name === viewName);

			// the same view is not found in the current stack, start getting up on the stack to find the same view instance if it's running
			if(!findSameView) {
				const recurseStackForTheSameView = (index: number) => {
					if(index < 0) {
						return null;
					}
	
					const stack = workingStack[index];
	
					if(!stack) {
						return null;
					}
	
					if(stack.done) {
						return recurseStackForTheSameView(index - 1);
					}
	
					const stackView = stack.views.find((f) => f.name === viewName);
	
					if(!stackView) {
						return recurseStackForTheSameView(index - 1);
					}
	
					return stackView;
				}
	
				findSameView = recurseStackForTheSameView(flowViewStackIndex - 1);
			}
	
			// Will use the same proxy
			if(findSameView && findSameView.viewProxy) {
				// input change should update the view
				const newProxy = findSameView.viewProxy;
				newProxy.update(input);
				return newProxy;
			}
		}

		const uid = v4();
		const viewProxy = new ViewProxy<ViewsMap, T>(null, (proxyInput) => {
			const layerItem = workingTree.views[<number>layer];
			if (uid !== layerItem.uid) {
				throw new Error(`Trying to update a view that was removed on layer ${layer} (uid has changed)`);
			}
			Object.assign(layerItem.input, proxyInput);
			this.update();
		}, () => {
			delete this.viewMap[uid];
			workingTree.views[<number>layer] = undefined;
			this.update();
		});
		const viewItem = {
			name: viewName,
			uid,
			viewProxy,
			children: [],
		};
		workingTree.views[layer] = viewItem;
		this.viewMap[uid] = viewItem;

		Object.assign(workingTree.views[layer], { input });
		this.update();

		return viewProxy;
	}
	private flow<
		Input extends any,
		Output extends any,
		State extends object,
		Notifications extends object,
		Events extends object,
		ExternalEvents extends object,
	>(
		hiddenViewParent: ViewProxy<ViewsMap, ViewsMap[keyof ViewsMap]>,
		flow: Flow<ViewsMap, Input, Output, State, Notifications, Events, ExternalEvents> | FlowProxy<ViewsMap, Input, Output, State, Notifications, Events, ExternalEvents>,
		input?: Input,
		viewParent: ViewProxy<ViewsMap, ViewsMap[keyof ViewsMap]> = null,
		options: FlowOptions = { autoStart: true },
	): Promise<Output> {
		let flowProxy: FlowProxy<ViewsMap, Input, Output>;
		const realViewParent = viewParent || hiddenViewParent;
		const viewParentUid = this.getViewUid(realViewParent);
		if (realViewParent && (!viewParentUid || !this.viewMap[viewParentUid])) {
			throw new Error(`Provided viewParent is invalid (was it removed?)`);
		}
		const workingStack = this.getViewStack(viewParentUid);
		const flowViewStackIndex = workingStack.length;
		if (!workingStack[flowViewStackIndex]) {
			workingStack[flowViewStackIndex] = {
				strings: {},
				views: [],
				done: false,
			};
		}
		if (flow instanceof FlowProxy) {
			flowProxy = new FlowProxy(null, flow.flowProcedure, flow.toolkit, input, flow.state, options);
		} else {
			flowProxy = new FlowProxy<ViewsMap, Input, Output>(null, flow, this.getToolkit(flowViewStackIndex, realViewParent, viewParentUid), input, {}, options);
		}
		flowProxy.then((result) => {
			// when a flow finishes, remove all its views
			// mark as done so no accidental views are added afterwards
			if (workingStack[flowViewStackIndex]) {
				workingStack[flowViewStackIndex].done = true;
				workingStack[flowViewStackIndex].views.splice(0);
				this.update();
			}
			return result;
		}).catch((err) => {
			if (err && err instanceof CancellationError) {
				// when a flow is canceled, remove all its views
				// mark as done so no accidental views are added afterwards
				if (workingStack[flowViewStackIndex]) {
					workingStack[flowViewStackIndex].done = true;
					workingStack[flowViewStackIndex].views.splice(0);
					this.update();
				}
			}
		});
		return flowProxy;
	}

	private async pipeDisplayLayer(
		flowViewStackIndex: number,
		hiddenViewParent: ViewProxy<ViewsMap, ViewsMap[keyof ViewsMap]>,
		transport: ReflowTransport,
		viewParent?: ViewProxy<ViewsMap, ViewsMap[keyof ViewsMap]> | null
	): Promise<{ remove: () => void }> {
		const realViewParent = viewParent || hiddenViewParent;
		const viewParentUid = this.getViewUid(realViewParent);
		if (realViewParent && (!viewParentUid || !this.viewMap[viewParentUid])) {
			throw new Error(`Provided viewParent is invalid (was it removed?)`);
		}
		const workingStack = this.getViewStack(viewParentUid);
		if (!workingStack[flowViewStackIndex]) {
			workingStack[flowViewStackIndex] = {
				strings: {},
				views: [],
				done: false,
			};
		}

		const remove = () => {
			if (workingStack[flowViewStackIndex]) {
				workingStack[flowViewStackIndex].done = true;
				workingStack[flowViewStackIndex].views.splice(0);
				this.update();
			}
		};

		await transport.initializeAsDisplay();
		transport.onViewTree((tree) => {
			if (!workingStack[flowViewStackIndex]) {
				return;
			}
			if (workingStack[flowViewStackIndex].done) {
				// done flow stack - block viewing new views
				return;
			}
			const inflated = this.inflateViewTree(tree);
			workingStack[flowViewStackIndex].views = inflated.reduce((a, b) => a.concat(b.views), []);
			// listen to virtual viewProxy events and done
			const viewsToIterate = [...workingStack[flowViewStackIndex].views];
			for (let i = 0; i < viewsToIterate.length; i++) {
				const viewItem = viewsToIterate[i];
				this.viewMap[viewItem.uid] = viewItem;
				viewItem.viewProxy?.addGlobalEventListener((name, data) => {
					transport.sendViewEvent(viewItem.uid, name, data);
				}).then((output) => {
					transport.sendViewDone(viewItem.uid, output);
				});
				if (viewItem.children) {
					viewsToIterate.push(...viewItem.children.reduce((a, b) => a.concat(b.views), []));
				}
			}
			this.update();
		});
		transport.sendViewSync();

		return {
			remove
		}
	}

	private registerEventListener<T extends object, U extends keyof T>(listenersMap: object, eventName: string | number | symbol, listener?: ExternalEventListener): Promise<T[U]> {
		if (!listenersMap[eventName]) {
			listenersMap[eventName] = [];
		}
		if (!listener) {
			return new Promise((resolve) => {
				const promiseListener = (data) => {
					this.deleteEventListener(listenersMap, eventName, promiseListener);
					resolve(data);
				};
				this.registerEventListener(listenersMap, eventName, promiseListener);
			});
		}
		listenersMap[eventName].push(listener);
	}

	private deleteEventListener(listenersMap: object, eventName: string | number | symbol, listener?: (data) => void) {
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

	async start<Input extends any, Output extends any>(flow: Flow<ViewsMap, Input, Output>, input?: any) {
		if (this.started) {
			return Promise.reject("Cannot start more than once per instance");
		}
		this.started = true;
		await this.transport.forEach((tp) => tp.initializeAsEngine());
		this.mainFlowProxy = <FlowProxy<ViewsMap, Input, Output>>this.flow(null, flow, input);
		return await this.mainFlowProxy;
	}
	cancel() {
		if (!this.mainFlowProxy) {
			return;
		}
		this.mainFlowProxy.cancel();
	}
	addEventListener(name: string | number | symbol, listener?: ExternalEventListener): Promise<any> {
		return this.registerEventListener(this.externalEventListeners, name, listener);
	}
	removeEventListener(name: string | number | symbol, listener?: ExternalEventListener) {
		this.deleteEventListener(this.externalEventListeners, name, listener);
	}
	async addTransport(transport: ReflowTransport<ViewerParameters>) {
		this.setupTransportListeners(transport);
		this.transport.push(transport);
		if (this.started) {
			await transport.initializeAsEngine();
		}
		this.update(transport);
	}
	removeTransport(transport: ReflowTransport<ViewerParameters>) {
		const idx = this.transport.indexOf(transport);
		if (-1 !== idx) {
			this.transport.splice(idx, 1);
		}
	}
}
