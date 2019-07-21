import { ViewInterface } from "@mcesystems/reflow";

export interface Input {
	currentLabel: string;
}

export interface Output {
	newLabel: string;
	canceled: boolean;
}

export default interface EditTodo extends ViewInterface<Input, {}, Output> { }
