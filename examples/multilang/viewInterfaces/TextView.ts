import { ViewInterface } from "@mcesystems/reflow";


export interface Input {
	header: string;
	subHeader: string;
	languages: string[];
}

export interface Events {
	changeLanguage: {
		language: string;
	}
}

export default interface TextView extends ViewInterface<Input, Events> { }
