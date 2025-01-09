import { ViewInterface } from "@mcesystems/reflow";


export interface Input {
	theme: string;
	prop1: string;
	prop2?: string;
}

export default interface AnimationTester extends ViewInterface<Input> { }
