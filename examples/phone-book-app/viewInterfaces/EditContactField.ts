import { ViewInterface } from "@mcesystems/reflow";
import Contact from "./shared/Contact";

export interface Input {
	label: string;
	currentValue: Contact[keyof Contact];
	error: string | null;
	skipEnabled?: boolean
}

export interface Output {
	newValue: Contact[keyof Contact];
	skipped?: boolean;
}

export default interface EditContactField extends ViewInterface<Input, {}, Output> { }
