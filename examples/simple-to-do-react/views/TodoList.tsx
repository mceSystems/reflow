import TodoListInterface from "../viewInterfaces/TodoList";
import { ReflowReactComponent } from "@mcesystems/reflow-react-display-layer";
import * as React from "react";

class TodoList extends ReflowReactComponent<TodoListInterface> {
	render() {
		const { title, todos, event, done } = this.props;
		return (
			<div
				style={{
					width: 512,
					height: "100%",
					borderRadius: 5,
					margin: "auto"
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between"
					}}
				>
					<span>{title}</span>
					<button onClick={() => event("newTodo", null)}>New Todo</button>
				</div>
				<div>
					{
						todos.map(({ label, id, done }) => (
							<div
								key={id}
								style={{
									display: "flex",
									alignItems: "center",
									fontSize: 12,
								}}
							>
								<div style={{ flexGrow: 1, textDecoration: done ? "line-through" : "" }}>{label}</div>
								<button onClick={() => event("todoEdit", { id })}>Edit</button>
								<input type="checkbox" checked={done} onChange={e => event("todoToggled", { id, done: e.target.checked })} />
							</div>
						))
					}
				</div>
			</div>
		);
	}
}

export default TodoList;
