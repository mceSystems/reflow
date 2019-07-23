import SlideInterface from "../viewInterfaces/Slide";
import { ReflowReactComponent } from "@mcesystems/reflow-react-display-layer";
import * as React from "react";

class Slide extends ReflowReactComponent<SlideInterface> {
	render() {
		const { title, content, children, done } = this.props;
		return (
			<div
				style={{

				}}
			>
				<h1>{title}</h1>
				<div>{content}</div>
				{
					children.length > 0 &&
					<div
						style={{
							width: "75%",
							margin: "auto",
							border: "1px solid #999",
							padding: 32
						}}
					>
						{children}
					</div>
				}
				<button style={{ float: "right" }} onClick={() => done()}>Next</button>
			</div>
		);
	}
}

export default Slide;
