import EditTodoInterface from "../viewInterfaces/EditTodo";
import { ReflowReactComponent } from "@mcesystems/reflow-react-display-layer";
import * as React from "react";

class EditTodo extends ReflowReactComponent<EditTodoInterface> {
	inputRef: HTMLInputElement = null;
	render() {
		const { done, currentLabel } = this.props;
		return (
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					background: "rgba(0,0,0,0.3)",
				}}
			>
				<div
					style={{
						background: "white",
						borderRadius: 5,
						padding: 4,
						boxShadow: "rgba(0,0,0,0.3) 0px 3px 5px",
					}}
				>
					<div>Edit Todo</div>
					<input defaultValue={currentLabel} ref={ref => this.inputRef = ref} style={{ display: "block", marginBottom: 4 }} type="text" />
					<div
						style={{
							display: "flex",
							justifyContent: "space-between"
						}}
					>
						<button onClick={() => done({ canceled: true, newLabel: "" })}>Cancel</button>
						<button onClick={() => done({ canceled: false, newLabel: this.inputRef.value })}>Done</button>
					</div>
				</div>
			</div>
		);
	}
}

export default EditTodo;
