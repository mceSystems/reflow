import { ReflowTransport } from "../ReflowTransport";
import { ReducedViewTree } from "../../Reflow";
import { ViewInterface, ViewsMapInterface } from "../../View";

import ServerSocket from "socket.io";
import ClientSocket from "socket.io-client";

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
				.on("view_event", <T extends ViewInterface, U extends keyof T["events"]>({ uid, eventName, eventData }: {uid: string; eventName: U; eventData: T["events"][U]}) => {
					for (const listener of this.viewEventListeners) {
						listener(uid, eventName, eventData);
					}
				})
				.on("view_function", <T extends ViewInterface<object, object, void, { [name: string]: any }>, U extends keyof T["functions"]>({ uid, requestId, functionName, functionData }: {uid: string; requestId: string; functionName: any; functionData: Parameters<T["functions"][U]>[0]}) => {
					let finish = false;
					for (const listener of this.viewFunctionListeners) {
						const result = listener(uid, functionName, functionData);
						if (result) {
							finish = true;
							if (Promise.resolve(result) === result) {
								result.then((functionResult) => {
									this.__socket.emit("view_function_result", { uid, requestId, functionResult });
								}).catch(() => {
									this.__socket.emit("view_function_result", { uid, requestId });
								});
							} else {
								this.__socket.emit("view_function_result", { uid, requestId, functionResult: result });
							}
						}
					}
					if (!finish) {
						this.__socket.emit("view_function_result", { uid, requestId });
					}
				})
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
	sendViewFunction<T extends ViewInterface<{}, {}, {}, any>, U extends keyof T["functions"]>(uid: string, functionName: U, functionData: T["functions"][U]): Promise<ReturnType<T["functions"][U]> | undefined>{
		this.requestIndex++;
		const requestId = this.requestIndex;
		return new Promise<ReturnType<T["functions"][U]>>((resolve) => {
			this.__socket.on("view_function_result", (result: { uid: string, requestId: number, functionResult?: ReturnType<T["functions"][U]>}) => {
				if (result.uid === uid, result.requestId === requestId) {
					resolve(result.functionResult);
				}
			})
			this.__socket.emit("view_function", { uid, requestId, functionName, functionData });
		})
	}
	sendViewSync() {
		this.__socket.emit("view_sync", {});
	}
	sendViewTree(tree: ReducedViewTree<ViewsMapInterface>) {
		this.__socket.emit("view_tree", { tree });
	}
	sendViewEvent<T extends ViewInterface, U extends keyof T["events"]>(uid: string, eventName: U, eventData: T["events"][U]): void {
		this.__socket.emit("view_event", { uid, eventName, eventData });
	}
	sendViewerParameters(viewerParameters: ViewerParameters): void {
		this.__socket.emit("viewer_parameters", { parameters: viewerParameters });
	}
	sendViewDone<T extends ViewInterface>(uid: string, output: T["output"]): void {
		this.__socket.emit("view_done", { uid, output });
	}
}
