import FlowHost from "./FlowHost";
import UserApproval from  "./UserApproval";
import Disclaimer from "./Disclaimer";

export const viewInterfaces = {
	FlowHost: <FlowHost>{},
	UserApproval: <UserApproval>{},
	Disclaimer: <Disclaimer>{},
};

export type ViewInterfacesType = typeof viewInterfaces;
