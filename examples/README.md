# Reflow Examples
Here you'll find a few examples for Reflow usage.\
It's important to mention again that the usage of React as the views implementation is a matter of choice and not forced by the general Reflow library.

#### Examples
[simple-to-do](./simple-to-do) - A basic introduction to Reflow, with (what else but a) To-Do app. This is an in-browser app with two simple views.\
[phone-book-app](./phone-book-app) - Demonstrates two major aspects of Reflow - Separation between flows and views, and multiple flow invocation.\
[multilang](./multilang) - Demonstrates the usage of the translation system in reflow, and how displayed strings can change without re-updating every single view.\
[presentation](./presentation) - Demonstrates the relationship the relationship between a view and its children, and how the flow controls it.\
[theming](./theming) - Demonstrates viewerParameters option of `Reflow` constructor and flow function, that affects the display layer general arguments.\
[cancelable-flow](./cancelable-flow) - Demonstrates how flows can be canceled in mid operation.\
[flow-events](./flow-events) - Demonstrates how flows can use events to communication between parent/child flows.\
[stateful-flows](./stateful-flows) - Demonstrates how flows can retain a state between different invocations.\
[routing-flow](./routing-flow) - Demonstrates how flows can assemble a route using "steps" and have anchors for returning back in the flow.