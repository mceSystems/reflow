import TextViewInterface from "../viewInterfaces/TextView";
import { ReflowReactComponent } from "@mcesystems/reflow-react-display-layer";
import * as React from "react";

class TextView extends ReflowReactComponent<TextViewInterface> {
	render() {
		const { languages, header, subHeader, event } = this.props;
		return (
			<div>
				<select onChange={e => event("changeLanguage", { language: e.target.value })}>
					{
						languages.map(lang => <option value={lang}>{lang}</option>)
					}
				</select>
				<h1>{header}</h1>
				<h5>{subHeader}</h5>
			</div>
		);
	}
}

export default TextView;
