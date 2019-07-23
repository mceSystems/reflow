import PresentationContainerInterface from "../viewInterfaces/PresentationContainer";
import { ReflowReactComponent } from "@mcesystems/reflow-react-display-layer";
import * as React from "react";

class PresentationContainer extends ReflowReactComponent<PresentationContainerInterface> {
	render() {
		const { title, children } = this.props;
		return (
			<div
				style={{

				}}
			>
				<h1>{title}</h1>
				<div
					style={{
						width: "50%",
						margin: "auto",
						boxShadow: "#999 0px 2px 5px",
						padding: 32
					}}
				>
					{children}
				</div>
			</div>
		);
	}
}

export default PresentationContainer;
