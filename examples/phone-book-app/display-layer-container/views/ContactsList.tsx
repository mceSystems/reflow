import ContactsListInterface from "../../viewInterfaces/ContactsList";
import { ReflowReactComponent } from "@mcesystems/reflow-react-display-layer";
import * as React from "react";

class ContactsList extends ReflowReactComponent<ContactsListInterface> {
	render() {
		const { title, contacts, event, } = this.props;
		return (
			<div
				style={{
					width: 512,
					height: "100%",
					borderRadius: 5,
					margin: "auto"
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between"
					}}
				>
					<span>{title}</span>
					<button onClick={() => event("newContact", null)}>New Contact</button>
				</div>
				<div>
					{
						contacts.map(({ id, name, phoneNumber, email }) => (
							<div
								key={id}
								style={{
									display: "flex",
									alignItems: "center",
									fontSize: 12,
								}}
							>
								<div style={{ flexGrow: 1 }}>
									<div>{name}</div>
									<div>{phoneNumber}</div>
									<div>{email}</div>
								</div>
								<button onClick={() => event("editContact", { id })}>Edit</button>
								<button onClick={() => event("deleteContact", { id }).then((value) => alert(value ? "contact deleted" : "fail to delete contact"))}>Delete</button>
							</div>
						))
					}
				</div>
			</div>
		);
	}
}

export default ContactsList;
