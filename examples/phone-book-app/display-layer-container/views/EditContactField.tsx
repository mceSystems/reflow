import EditContactFieldInterface from "../../viewInterfaces/EditContactField";
import { ReflowReactComponent } from "@mcesystems/reflow-react-display-layer";
import * as React from "react";

class EditContactField extends ReflowReactComponent<EditContactFieldInterface> {
	inputRef: HTMLInputElement = null;
	render() {
		const { done, currentValue, label, error, skipEnabled } = this.props;
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
					<div>{label}</div>
					<input key={label} defaultValue={currentValue} ref={ref => this.inputRef = ref} style={{ display: "block", marginBottom: 4 }} type="text" />
					{error && <div style={{ fontSize: 11, marginBottom: 8, color: "red" }}>{error}</div>}
					<div
						style={{
							display: "flex",
							justifyContent: "space-between"
						}}
					>
						{skipEnabled && <button onClick={() => done({ skipped: true, newValue: currentValue })}>Skip</button>}
						<button onClick={() => done({ newValue: this.inputRef.value })}>Done</button>
					</div>
				</div>
			</div>
		);
	}
}

export default EditContactField;
