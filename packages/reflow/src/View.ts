export interface ViewInterface<Input extends object = {}, Events extends object = {}, Output extends any = void> {
	input: Input;
	output: Output;
	events: Events;
}

export interface ViewsMapInterface {
	[key: string]: ViewInterface<any, any, any>;
}

export interface ViewOptions {
	/**
	 * Reflow will try to find in the stack the same view and reuse while only updating the props
	 * ex: Preloader with animation - Will only re-render the component instead of removing the instance and creating a new one every time
	 */
	singletonView?: true;
};
