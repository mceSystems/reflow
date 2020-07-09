import { ReflowTransport } from "../ReflowTransport";
import { ReducedViewTree } from "../../Reflow";
import { ViewInterface, ViewsMapInterface } from "../../View";

import ServerSocket from "socket.io";
import ClientSocket from "socket.io-client";
import { ReturnUnpack, PromiseUnpacked, ParamsUnpack } from "../../ViewProxy";

interface WebSocketConnectionOptions {
	host?: string;
	port?: number;
}

export default class WebSocketsTransport<ViewerParameters = {}> extends ReflowTransport<ViewerParameters> {
	private __connectionOptions: WebSocketConnectionOptions;
	private __socket: ServerSocket | ClientSocket;

	private requestIndex: number = 0;

	constructor(connectionOptions: WebSocketConnectionOptions | undefined = {}) {
		super(connectionOptions);
		this.__connectionOptions = connectionOptions;
		this.__socket = null;
	}
	initializeAsEngine() {
		const { port = 3000 } = this.__connectionOptions || {};

		const server = require("http").createServer();
		const io = require("socket.io")(server);
		server.listen(port);
		this.__socket = io;
		this.__socket.on("connection", (socket) => {
			socket
				.on("view_event", <T extends ViewInterface, U extends keyof T["events"]>({ uid, requestId, eventName, eventData }: {uid: string; requestId: string; eventName: U; eventData: ParamsUnpack<T["events"][U]>}) => {
					let result: ReturnUnpack<T["events"][U]>;
					for (const listener of this.viewEventListeners) {
						const listenerResult = listener(uid, eventName, eventData);
						if (listenerResult) {
							result = listenerResult;
						}
					}
					if (result) {
						if (Promise.resolve(result) === result) {
							const promiseResult = result as Promise<PromiseUnpacked<typeof result>>;
							promiseResult.then((eventResult) => {
								this.__socket.emit("view_event_result", { uid, requestId, eventResult });
								}).catch(() => {
								this.__socket.emit("view_event_result", { uid, requestId });
								});
						} else {
							this.__socket.emit("view_event_result", { uid, requestId, eventResult: result });
						}
					} else {
						this.__socket.emit("view_function_result", { uid, requestId });
					}				})
				.on("view_done", ({ uid, output }) => {
					for (const listener of this.viewDoneListeners) {
						listener(uid, output);
					}
				})
				.on("view_sync", (n) => {
					for (const listener of this.viewSyncListeners) {
						listener();
					}
				});
		});

		return Promise.resolve();
	}
	initializeAsDisplay() {
		const io = require("socket.io-client");
		const { host = "localhost", port = 3000 } = this.__connectionOptions || {};

		const socket = io(`http://${host}:${port}`);

		this.__socket = socket;
		socket
			.on("connect", () => {
				this.sendViewSync();
			})
			.on("view_tree", ({ tree }) => {
				for (const listener of this.viewStackUpdateListeners) {
					listener(tree);
				}
			})
			.on("viewer_parameters", ({ parameters }) => {
				for (const listener of this.viewerParametersListeners) {
					listener(parameters);
				}
			});

		return Promise.resolve(this);
	}
	sendViewSync() {
		this.__socket.emit("view_sync", {});
	}
	sendViewTree(tree: ReducedViewTree<ViewsMapInterface>) {
		this.__socket.emit("view_tree", { tree });
	}
	sendViewEvent<T extends ViewInterface, U extends keyof T["events"]>(uid: string, eventName: U, eventData: ParamsUnpack<T["events"][U]>): Promise<ReturnUnpack<T["events"][U]>> {
		this.requestIndex++;
		const requestId = this.requestIndex;
		return new Promise<ReturnUnpack<T["events"][U]>>((resolve) => {
			this.__socket.on("view_event_result", (result: { uid: string, requestId: number, eventResult?: ReturnUnpack<T["events"][U]>}) => {
				if (result.uid === uid, result.requestId === requestId) {
					resolve(result.eventResult);
				}
			})
			this.__socket.emit("view_event", { uid, requestId, eventName, eventData });
		});
	}
	sendViewerParameters(viewerParameters: ViewerParameters): void {
		this.__socket.emit("viewer_parameters", { parameters: viewerParameters });
	}
	sendViewDone<T extends ViewInterface>(uid: string, output: T["output"]): void {
		this.__socket.emit("view_done", { uid, output });
	}
}
