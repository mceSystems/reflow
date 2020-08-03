import { ReflowTransport } from "../ReflowTransport";
import { ReducedViewTree } from "../../Reflow";
import { ViewInterface, ViewsMapInterface } from "../../View";

interface WorkerConnectionOptions {
  worker?: Worker;
}

interface WorkerEvent {
  name: string;
  data: any;
}

interface MessageClient {
  onmessage?: (message: WorkerEvent) => void;
  readonly postMessage: (message: WorkerEvent) => void;
}

export default class WebSocketsTransport<
  ViewerParameters = {}
> extends ReflowTransport<ViewerParameters> {
  private __worker?: MessageClient;

  constructor(connectionOptions: WorkerConnectionOptions) {
    super(connectionOptions);
    this.__worker = (connectionOptions.worker as unknown) as MessageClient;
  }
  initializeAsEngine() {
    this.__worker = (self as unknown) as MessageClient;
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
        this.__worker.postMessage({ name: "connect", data: {} });
      }
    };
    this.__worker.onmessage = (message: WorkerEvent) => {
      onEvent(message.data);
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
    this.__worker.onmessage = (e) => onEvent(e.data);
    this.__worker.postMessage({ name: "connect", data: {} });

    return Promise.resolve(this);
  }
  sendViewSync() {
    const event: WorkerEvent = { name: "view_sync", data: {} };
    this.__worker.postMessage(event);
  }
  sendViewTree(tree: ReducedViewTree<ViewsMapInterface>) {
    const event: WorkerEvent = { name: "view_tree", data: { tree } };
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
    };
    this.__worker.postMessage(event);
  }
  sendViewerParameters(viewerParameters: ViewerParameters): void {
    const event: WorkerEvent = {
      name: "viewer_parameters",
      data: { parameters: viewerParameters },
    };
    this.__worker.postMessage(event);
  }
  sendViewDone<T extends ViewInterface>(
    uid: string,
    output: T["output"]
  ): void {
    const event: WorkerEvent = { name: "view_done", data: { uid, output } };
    this.__worker.postMessage(event);
  }
}
