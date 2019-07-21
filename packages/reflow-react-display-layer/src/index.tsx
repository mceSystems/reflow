import { ReflowTransport, ViewsMapInterface } from "@mcesystems/reflow";
import { render } from "react-dom";
import * as React from "react";
import ReflowDisplayLayer, { ViewsComponents } from "./ReflowDisplayLayer";

export * from "./ReflowReactComponent";

export interface ReactReflowOptions<ViewMap extends ViewsMapInterface> {
	transport: ReflowTransport;
	element: Element;
	views: ViewsComponents<ViewMap>;
	wrapper?: React.ComponentClass<{ themeOptions?: {} }>;
}

export function renderDisplayLayer<ViewMap extends ViewsMapInterface>({ transport, element, views, wrapper }: ReactReflowOptions<ViewMap>) {
	const Wrapper = (wrapper || React.Fragment) as typeof wrapper;

	transport.onViewerParameters(({ theme: themeOptions }) => {
		render(<Wrapper themeOptions={themeOptions}><ReflowDisplayLayer transport={transport} views={views} /></Wrapper>, element);
	});

	transport.initializeAsDisplay();
}
