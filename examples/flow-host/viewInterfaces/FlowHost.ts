import { ViewInterface } from "@mcesystems/reflow";


export interface Input {
	title: string;
}

export default interface FlowHost extends ViewInterface<Input> { }
