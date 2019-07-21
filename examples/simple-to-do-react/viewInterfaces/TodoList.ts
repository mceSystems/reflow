import { ViewInterface } from "@mcesystems/reflow";

export interface Todo {
	id: string;
	label: string;
	done: boolean;
}

export interface Input {
	title: string;
	todos: Todo[];
}

export interface Events {
	todoToggled: {
		id: string;
		done: boolean;
	};
	newTodo: void;
	todoEdit: {
		id: string;
	};
}

export default interface TodoList extends ViewInterface<Input, Events> { }
