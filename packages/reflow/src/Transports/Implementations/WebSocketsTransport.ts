import { ReflowTransport } from "../ReflowTransport";
import { ReducedViewTree } from "../../Reflow";
import { ViewInterface, ViewsMapInterface } from "../../View";

import { Server as ServerSocket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import { CorsOptions } from "cors";

export { CorsOptions } from "cors";

interface WebSocketConnectionOptions {
	host?: string;
	port?: number;
	cors?: CorsOptions;
}

export default class WebSocketsTransport<ViewerParameters = {}> extends ReflowTransport<ViewerParameters> {
	private __connectionOptions: WebSocketConnectionOptions;
	private __socket: ServerSocket | ClientSocket;

	constructor(connectionOptions: WebSocketConnectionOptions | undefined = {}) {
		super(connectionOptions);
		this.__connectionOptions = connectionOptions;
		this.__socket = null;
	}
	initializeAsEngine() {
		const { port = 3000, host = "127.0.0.1", cors } = this.__connectionOptions || {};

		const httpServer = require("http").createServer();
		const { Server } = require("socket.io") as { Server: typeof ServerSocket };
		const io = new Server(httpServer, {
			cors,
		});
		httpServer.listen({
			port,
			host,
		});
		this.__socket = io;
		this.__socket.on("connection", (socket) => {
			socket
				.on("view_event", <T extends ViewInterface, U extends keyof T["events"]>({ uid, eventName, eventData }: { uid: string; eventName: U; eventData: T["events"][U] }) => {
					for (const listener of this.viewEventListeners) {
						listener(uid, eventName, eventData);
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
		const { io } = require("socket.io-client");
		const { host = "127.0.0.1", port = 3000 } = this.__connectionOptions || {};

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
