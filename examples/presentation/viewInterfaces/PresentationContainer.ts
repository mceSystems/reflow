import { ViewInterface } from "@mcesystems/reflow";


export interface Input {
	title: string;
}

export default interface PresentationContainer extends ViewInterface<Input> { }
