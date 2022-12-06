import { ViewInterface } from "@mcesystems/reflow";


export interface Input {
	title: string;
	itemsToApprove: string[];
}

export interface Events {
	itemChanged: {
		item: string;
		checked: boolean;
	}
}

export type Output = boolean;


export default interface UserApproval extends ViewInterface<Input, Events, Output> { }
