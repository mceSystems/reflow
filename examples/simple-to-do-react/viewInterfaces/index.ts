import TodoList from "./TodoList";
import EditTodo from "./EditTodo";

export const viewInterfaces = {
	TodoList: <TodoList>{},
	EditTodo: <EditTodo>{},
};

export type ViewInterfacesType = typeof viewInterfaces;
