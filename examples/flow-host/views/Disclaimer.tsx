import DisclaimerInterface from "../viewInterfaces/Disclaimer";
import { ReflowReactComponent } from "@mcesystems/reflow-react-display-layer";
import * as React from "react";

class Disclaimer extends ReflowReactComponent<DisclaimerInterface> {
	render() {
		const { content } = this.props;
		return (
			<div
				style={{}}
			>
				{content}
			</div>
		);
	}
}

export default Disclaimer;
