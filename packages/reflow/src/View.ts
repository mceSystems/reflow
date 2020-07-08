export interface ViewInterface<Input extends object = {}, Events extends object = {}, Output extends any = void, Functions extends Record<keyof Functions, (prameters: object) => any> = {}> {
	input: Input;
	output: Output;
	events: Events;
	functions: Functions;
}

export interface ViewsMapInterface {
	[key: string]: ViewInterface<any, any, any, any>;
}
