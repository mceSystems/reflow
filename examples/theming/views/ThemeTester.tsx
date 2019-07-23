import ThemeTesterInterface from "../viewInterfaces/ThemeTester";
import { ReflowReactComponent } from "@mcesystems/reflow-react-display-layer";
import * as React from "react";

class ThemeTester extends ReflowReactComponent<ThemeTesterInterface> {
	render() {
		const { themes, header, subHeader, event } = this.props;
		return (
			<div>
				<select onChange={e => event("changeTheme", { theme: e.target.value })}>
					{
						themes.map(theme => <option value={theme}>{theme}</option>)
					}
				</select>
				<h1>{header}</h1>
				<h5>{subHeader}</h5>
			</div>
		);
	}
}

export default ThemeTester;
