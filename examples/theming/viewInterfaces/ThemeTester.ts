import { ViewInterface } from "@mcesystems/reflow";


export interface Input {
	header: string;
	subHeader: string;
	themes: string[];
}

export interface Events {
	changeTheme: {
		theme: string;
	}
}

export default interface ThemeTester extends ViewInterface<Input, Events> { }
