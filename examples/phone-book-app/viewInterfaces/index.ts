import ContactsList from "./ContactsList";
import EditContactField from "./EditContactField";

export const viewInterfaces = {
	ContactsList: <ContactsList>{},
	EditContactField: <EditContactField>{},
};

export type ViewInterfacesType = typeof viewInterfaces;
