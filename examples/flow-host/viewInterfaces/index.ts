import FlowHost from "./FlowHost";
import UserApproval from  "./UserApproval";

export const viewInterfaces = {
	FlowHost: <FlowHost>{},
	UserApproval: <UserApproval>{},
};

export type ViewInterfacesType = typeof viewInterfaces;
