import { Flow } from "@mcesystems/reflow";

import { ViewInterfacesType } from "../../viewInterfaces";
import { ContactListEntry } from "../../viewInterfaces/ContactsList";

import editContact from "./editContact";

export default <Flow<ViewInterfacesType>>(async ({ view, views, flow }) => {
	console.log("Entered main flow");

	let contacts: ContactListEntry[] = [];
	const contactList = view(0, views.ContactsList, {
		contacts,
		title: "My Contacts"
	})
		.on("deleteContact", async ({ id }) => {
			if (contacts.find((contact) => contact.id === id)) {
				contacts = contacts.filter((contact) => contact.id !== id);
				contactList.update({ contacts });
				return true;
			} else {
				return false;
			}
		})
		.on("newContact", async () => {
			console.log("Got new contact request");
			// @ts-ignore
			const newContact = await flow(editContact, { }) as ContactListEntry;
			newContact.id = `contact-${Math.random()}`;
			console.log(`Created contact ${newContact.id}`);
			contacts.push(newContact);
			contactList.update({ contacts });
		})
		.on("editContact", async ({ id }) => {
			console.log(`Got edit contact request for contact ${id}`);
			const contact = contacts.find(n => id === n.id);
			if (!contact) {
				// handle non-existing contact
				return;
			}
			const editedContact = await flow(editContact, {
				contact,
			}) as ContactListEntry;
			Object.assign(contact, editedContact);
			contactList.update({ contacts });
		});

	await contactList;
});
