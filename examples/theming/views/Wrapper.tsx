import * as React from "react";
import { ViewerParameters } from "../viewInterfaces";

export class Wrapper extends React.Component<ViewerParameters> {
	render() {
		const { color, children } = this.props;
		return (
			<div style={{ color }}>
				{children}
			</div>
		);
	}
}
