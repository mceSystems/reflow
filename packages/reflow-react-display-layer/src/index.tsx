import { ReflowTransport, ViewsMapInterface } from "@mcesystems/reflow";
import { createRoot } from "react-dom/client";
import * as React from "react";
import { useState, useEffect } from "react";
import ReflowDisplayLayer, { ViewsComponents } from "./ReflowDisplayLayer";
import { render } from "react-dom";

export * from "./ReflowReactComponent";

export interface ReactReflowOptions<ViewMap extends ViewsMapInterface, ViewerParameters = {}> {
	transport: ReflowTransport<ViewerParameters>;
	element: Element;
	views: ViewsComponents<ViewMap>;
	wrapper?: React.ComponentClass<ViewerParameters>;
}

export interface ReactReflowDisplayLayerElementProps<ViewMap extends ViewsMapInterface, ViewerParameters = {}> {
	transport: ReflowTransport<ViewerParameters>;
	views: ViewsComponents<ViewMap>;
	wrapper?: React.ComponentClass<ViewerParameters>;
}

export const ReflowDisplayLayerElement = <ViewMap extends ViewsMapInterface, ViewerParameters = {}>({
	views,
	transport,
	wrapper
}: ReactReflowDisplayLayerElementProps<ViewMap, ViewerParameters>) => {
	const Wrapper = (wrapper || React.Fragment) as typeof wrapper;
	const [viewerParams, setViewerParams] = useState({} as ViewerParameters);

	useEffect(() => {
		transport.onViewerParameters((params) => {
			setViewerParams(params);
		});

		transport.initializeAsDisplay();
	}, [transport]);

	return (
		<Wrapper {...viewerParams}>
			<ReflowDisplayLayer transport={transport} views={views} />
		</Wrapper>
	);
}

export function renderDisplayLayer<ViewMap extends ViewsMapInterface, ViewerParameters = {}>({ transport, element, views, wrapper }: ReactReflowOptions<ViewMap, ViewerParameters>) {
	const root = createRoot(element);
	root.render(<ReflowDisplayLayerElement transport={transport} views={views} wrapper={wrapper} />);
}
