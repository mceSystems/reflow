import { ReflowTransport } from "../ReflowTransport";
import { ReducedViewTree } from "../../Reflow";
import { ViewInterface, ViewsMapInterface } from "../../View";

interface WorkerConnectionOptions {
  /**
   * <pre> if your using web worker please pass the Worker from the diplay layer or self from the server. </pre>
   * <pre> if your using web service please pass a the BroadcastChannel from both the diplay layer or the server. </pre>
   * <pre> if you want to use custom event based transport please pass a MessageClient. </pre>
   */
  connection: Worker | MessageClient | BroadcastChannel | Window;
}

BroadcastChannel

interface WorkerEvent {
  name: string;
  data: any;
  source: "__internal__" | "__external__";
}

interface MessageClient {
  onmessage?: (message: { data: WorkerEvent }) => void;
  readonly postMessage: (message: WorkerEvent) => void;
}

export default class WebSocketsTransport<
  ViewerParameters = {}
> extends ReflowTransport<ViewerParameters> {
  private __worker: MessageClient = {
    postMessage: () => {
      throw new Error("can not emit to worker Reflow main flow is started.");
    },
  };

  private eventListeners: Record<
    string,
    ((message: WorkerEvent) => void)[]
  > = {};

  constructor(connectionOptions: WorkerConnectionOptions) {
    super(connectionOptions);
    this.__worker = (connectionOptions.connection as unknown) as MessageClient;
  }

  public addWorkerEventListener = (
    event: string,
    handler: (data: any) => void
  ) => {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(handler);
  };

  public removeWorkerEventListener = (
    event: string,
    handler: (data: any) => void
  ) => {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event] = this.eventListeners[event].filter(
      (currentHandler) => currentHandler !== handler
    );
  };

  public emitWorkerEvent = (event: string, data: any) => {
    this.__worker.postMessage({ name: event, source: "__external__", data });
  };

  private onExternalEvent = (message: WorkerEvent) => {
    if (this.eventListeners[message.name]) {
      this.eventListeners[message.name].forEach((listener) =>
        listener(message.data)
      );
    }
  };

  initializeAsEngine() {
    const onViewEvent = <T extends ViewInterface, U extends keyof T["events"]>({
      uid,
      eventName,
      eventData,
    }: {
      uid: string;
      eventName: U;
      eventData: T["events"][U];
    }) => {
      for (const listener of this.viewEventListeners) {
        listener(uid, eventName, eventData);
      }
    };
    const onViewDone = ({ uid, output }) => {
      for (const listener of this.viewDoneListeners) {
        listener(uid, output);
      }
    };
    const onViewSync = (n) => {
      for (const listener of this.viewSyncListeners) {
        listener();
      }
    };
    const onEvent = (event: WorkerEvent) => {
      if (event.name === "view_event") {
        onViewEvent(event.data);
      } else if (event.name === "view_done") {
        onViewDone(event.data);
      } else if (event.name === "view_sync") {
        onViewSync(event.data);
      } else if (event.name === "connect") {
        this.__worker.postMessage({
          name: "connect",
          data: {},
          source: "__internal__",
        });
      }
    };
    this.__worker.onmessage = (message) => {
      if (!message || typeof message !== "object") {
        return;
      }
      if (message.data.source === "__internal__") {
        onEvent(message.data);
      }
      if (message.data.source === "__external__") {
        this.onExternalEvent(message.data);
      }
    };

    return Promise.resolve();
  }
  initializeAsDisplay() {
    const onConnect = () => {
      this.sendViewSync();
    };
    const onViewTree = ({ tree }) => {
      for (const listener of this.viewStackUpdateListeners) {
        listener(tree);
      }
    };
    const onViewerParameters = ({ parameters }) => {
      for (const listener of this.viewerParametersListeners) {
        listener(parameters);
      }
    };

    const onEvent = (event: WorkerEvent) => {
      if (event.name === "connect") {
        onConnect();
      } else if (event.name === "view_tree") {
        onViewTree(event.data);
      } else if (event.name === "viewer_parameters") {
        onViewerParameters(event.data);
      }
    };
    this.__worker.onmessage = (message) => {
      if (!message || typeof message !== "object") {
        return;
      }
      if (message.data.source === "__internal__") {
        onEvent(message.data);
      }
      if (message.data.source === "__external__") {
        this.onExternalEvent(message.data);
      }
    };
    this.__worker.postMessage({
      name: "connect",
      data: {},
      source: "__internal__",
    });

    return Promise.resolve(this);
  }
  sendViewSync() {
    const event: WorkerEvent = {
      name: "view_sync",
      data: {},
      source: "__internal__",
    };
    this.__worker.postMessage(event);
  }
  sendViewTree(tree: ReducedViewTree<ViewsMapInterface>) {
    const event: WorkerEvent = {
      name: "view_tree",
      data: { tree },
      source: "__internal__",
    };
    this.__worker.postMessage(event);
  }
  sendViewEvent<T extends ViewInterface, U extends keyof T["events"]>(
    uid: string,
    eventName: U,
    eventData: T["events"][U]
  ): void {
    const event: WorkerEvent = {
      name: "view_event",
      data: { uid, eventName, eventData },
      source: "__internal__",
    };
    this.__worker.postMessage(event);
  }
  sendViewerParameters(viewerParameters: ViewerParameters): void {
    const event: WorkerEvent = {
      name: "viewer_parameters",
      data: { parameters: viewerParameters },
      source: "__internal__",
    };
    this.__worker.postMessage(event);
  }
  sendViewDone<T extends ViewInterface>(
    uid: string,
    output: T["output"]
  ): void {
    const event: WorkerEvent = {
      name: "view_done",
      data: { uid, output },
      source: "__internal__",
    };
    this.__worker.postMessage(event);
  }
}
