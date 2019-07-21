import { Flow } from "@mcesystems/reflow";

import { ViewInterfacesType } from "../viewInterfaces";
import { Todo } from "../viewInterfaces/TodoList";

export default <Flow<ViewInterfacesType>>(async ({ view, views }) => {
	const todos: Todo[] = [];
	// Using the view() function to display the TodoList component, at layer 0 of this flow
	const todoView = view(0, views.TodoList, {
		title: "My Todo List",
		todos
	})
		.on("newTodo", async () => {
			// New todo item was requested - using the view() function to display the EditTodo component, at layer 1 of this flow
			// Then we'll take the given label and create a new entry in the todos array.
			// Then we'll simply update by calling the view's update() method
			const editView = view(1, views.EditTodo, {
				currentLabel: "",
			});
			const { canceled, newLabel } = await editView;
			// remove the view
			editView.remove();
			if (canceled) {
				return;
			}
			todos.push({
				label: newLabel,
				id: `todo-${Date.now()}`,
				done: false,
			});
			todoView.update({ todos });
		})
		.on("todoEdit", async ({ id }) => {
			// Edit todo item was requested - using the view() function to display the EditTodo component, at layer 1 of this flow
			// Then we'll take the given label assign it to the todo entry with the same id.
			// Then we'll simply update by calling the view's update() method
			const editedTodo = todos.find(todo => id === todo.id);
			const editView = view(1, views.EditTodo, {
				currentLabel: editedTodo.label,
			});
			const { canceled, newLabel } = await editView;
			// remove the view
			editView.remove();
			if (canceled) {
				return;
			}
			editedTodo.label = newLabel;
			todoView.update({ todos });
		})
		.on("todoToggled", async ({ id, done }) => {
			// Toggle todo item was requested - we'll find the todo entry with the same id 
			// and update it according to the 'done' boolean that arrived with the event 
			const toggledTodo = todos.find(todo => id === todo.id);
			toggledTodo.done = done;
			todoView.update({ todos });
		});

	// awaiting a never-ending promise to hang the flow
	await new Promise(() => { });
});

