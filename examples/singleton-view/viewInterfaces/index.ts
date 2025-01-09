import AnimationTester from "./AnimationTester";

export const viewInterfaces = {
	AnimationTester: <AnimationTester>{},
};

export type ViewInterfacesType = typeof viewInterfaces;

export interface ViewerParameters {
	color: string;
}
