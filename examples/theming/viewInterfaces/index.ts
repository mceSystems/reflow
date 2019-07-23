import ThemeTester from "./ThemeTester";

export const viewInterfaces = {
	ThemeTester: <ThemeTester>{},
};

export type ViewInterfacesType = typeof viewInterfaces;

export interface ViewerParameters {
	color: string;
}
