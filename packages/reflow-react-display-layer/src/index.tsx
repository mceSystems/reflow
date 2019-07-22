import { ReflowTransport, ViewsMapInterface } from "@mcesystems/reflow";
import { render } from "react-dom";
import * as React from "react";
import ReflowDisplayLayer, { ViewsComponents } from "./ReflowDisplayLayer";

export * from "./ReflowReactComponent";

export interface ReactReflowOptions<ViewMap extends ViewsMapInterface, ViewerParameters = {}> {
	transport: ReflowTransport<ViewerParameters>;
	element: Element;
	views: ViewsComponents<ViewMap>;
	wrapper?: React.ComponentClass<ViewerParameters>;
}

export function renderDisplayLayer<ViewMap extends ViewsMapInterface, ViewerParameters = {}>({ transport, element, views, wrapper }: ReactReflowOptions<ViewMap, ViewerParameters>) {
	const Wrapper = (wrapper || React.Fragment) as typeof wrapper;

	transport.onViewerParameters((viewerParams) => {
		render(<Wrapper {...viewerParams}>
			<ReflowDisplayLayer transport={transport} views={views} />
		</Wrapper>, element);
	});

	transport.initializeAsDisplay();
}
