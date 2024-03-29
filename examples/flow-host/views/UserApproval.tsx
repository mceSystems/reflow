import UserApprovalInterface from "../viewInterfaces/UserApproval";
import { ReflowReactComponent } from "@mcesystems/reflow-react-display-layer";
import * as React from "react";

class UserApproval extends ReflowReactComponent<UserApprovalInterface> {
	render() {
		const { title, itemsToApprove, done, event, children } = this.props;
		return (
			<div style={{}}>
				<h1>{title}</h1>
				{
					itemsToApprove.map(item => (
						<div>
							<input type="checkbox" onChange={(e) => event("itemChanged", { item, checked: e.target.checked })}></input>
							<span>{item}</span>
						</div>
					))
				}
				<div style={{ padding: 8, margin: 8, border: "1px solid black" }}>
					{children}
				</div>
				<button style={{ float: "right" }} onClick={() => done(true)}>Agree</button>
			</div>
		);
	}
}

export default UserApproval;
