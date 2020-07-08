import * as React from "react";
import { ViewInterface } from "@mcesystems/reflow";

type Unpacked<T> = // unpack if promise
    T extends Promise<infer U> ? U :
    T;

export type ReflowReactComponentProps<T extends ViewInterface<any, any, any, any>, ExternalProps = void> = T["input"] & {
	children?: React.ReactNode[],
	event: <U extends keyof T["events"]>(eventName: U, eventData: T["events"][U]) => void;
	done: (output: T["output"]) => void;
	call: <U extends keyof T["functions"]>(functionName: U, functionData: Parameters<T["functions"][U]>[0]) => Promise<Unpacked<ReturnType<T["functions"][U]>>>;
} & ExternalProps;

export type ReflowReactComponentClass<T extends ViewInterface<any, any, any>, ExternalProps = void, State = never>
	= React.ComponentClass<ReflowReactComponentProps<T, ExternalProps>, State>;

export type ReflowReactComponentFunction<T extends ViewInterface<any, any, any>, ExternalProps = void>
	= React.FunctionComponent<ReflowReactComponentProps<T, ExternalProps>>;

export class ReflowReactComponent<T extends ViewInterface<any, any, any>, ExternalProps = void, State = never>
	extends React.Component<ReflowReactComponentProps<T, ExternalProps>, State> { }
