import PresentationContainer from "./PresentationContainer";
import Slide from  "./Slide";

export const viewInterfaces = {
	PresentationContainer: <PresentationContainer>{},
	Slide: <Slide>{},
};

export type ViewInterfacesType = typeof viewInterfaces;
