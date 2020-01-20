import { Flow } from "@mcesystems/reflow";

import { ViewInterfacesType } from "../viewInterfaces";

export default <Flow<ViewInterfacesType>>(async ({ view, views, tx, strings, language, fallbackLanguages }) => {
	// we'll create a dictionary that defines header and sub-header translations for multiple languages
	// this object can of course be read from a configuration file, or server configuration
	const dictionary = {
		english: {
			my_text_header: "Hello ${name}$!",
			my_text_sub_header: "And a good day",
			fallback_example_string: "A fallback english translation in case the desired language has no translation",
			another_fallback_example_string: "Another fallback english translation"
		},
		french: {
			my_text_header: "Bonjour ${name}$!",
			my_text_sub_header: "Et une bonne journée",
			fallback_example_string: "A fallback french translation in case the desired language has no translation"
		},
		german: {
			my_text_header: "Hallo ${name}$!",
			my_text_sub_header: "Und einen guten Tag",
		},
		italian: {
			my_text_header: "Ciao ${name}$!",
			my_text_sub_header: "E una buona giornata",
		}
	};
	// set the flow's string using string()
	strings(dictionary);
	// set the initial language - should be a key of the dictionary
	// you can optionally set the fallback languages, prioritized, in case the desired language has no translation for a key
	language("english", ["french", "english"]);
	// Fallback languages can also be set separately using:
	// 	fallbackLanguages(["french", "english"]);
	view(0, views.TextView, {
		// using tx() will create a string that, when the language is changed, automatically updates the view tree
		subHeader: tx("my_text_sub_header"),
		// and we can even use a template with dynamic dictionary to replaces the tokens
		header: tx("my_text_header", {
			name: "Bob",
		}),
		notes: [
			tx("fallback_example_string"), // will take the french translation
			tx("another_fallback_example_string"), // will take the english translation
		],
		languages: Object.keys(dictionary),
	})
		.on("changeLanguage", ({ language: lang }) => {
			// change the language according to the selection
			// this will automatically update anything gone through the tx() function
			language(lang);
		})
	// awaiting a never-ending promise to hang the flow
	await new Promise(() => { });
});

