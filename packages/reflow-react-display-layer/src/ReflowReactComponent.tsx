import * as React from "react";
import { ViewInterface } from "@mcesystems/reflow";

export type ReflowReactComponentClass<T extends ViewInterface<any, any, any>, ExternalProps = void, State = never> = React.ComponentClass<T["input"] & {
	children?: React.ReactNode[],
	event: <U extends keyof T["events"]>(eventName: U, eventData: T["events"][U]) => void;
	done: (output: T["output"]) => void;
} & ExternalProps, State>;

export class ReflowReactComponent<T extends ViewInterface<any, any, any>, ExternalProps = void, State = never> extends React.Component<T["input"] & {
	children?: React.ReactNode[],
	event: <U extends keyof T["events"]>(eventName: U, eventData: T["events"][U]) => void;
	done: (output: T["output"]) => void;
} & ExternalProps, State> {}
