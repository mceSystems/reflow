import { ViewInterface } from "@mcesystems/reflow";


export interface Input {
	title: string;
	content: string;
}

export default interface Slide extends ViewInterface<Input> { }
