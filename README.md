# Reflow
Reflow is an application-flow and UI management library. \
It provides a set of utilities to conveniently manage an application UI directly from descriptive and clear business logic code.

Using strongly typed contracts between the UI components and the application's flows, you can use Reflow to build a re-usable library of shared components, that will server multiple applications with multiple flows.

In addition, the structure of the library let's you easily obtain a remote connection between the application's flow and it's UI, 
so an application can run on one machine, and be viewed from another (and even multiple other) machine

## When should I use reflow?
Reflow is not suitable to server as the engine for any application. In most of the cases, libraries like Redux or MobX would be a much wiser choice to run your application. Reflow will benefit you in cases where:
* You have multiple applications with different flows, but you want to use the same UI components
* Your business logic is "heavy" but UI should be kept "lite" or "dumb"
* You want you application flow to run on a different machine or in a different process than the UI (i.e. flow on node process, UI in a browser)
* You want to separate flow development from UI development (i.e. two teams working in parallel)

### Before we begin - Typescript!
As you'll see in the docs, examples and the library's code, Typescript is a version important element of the power of Reflow. \
If you're not a fan - consider being one :)

## Core concepts
The 3 elements of a Reflow-based application are *flows*, *views* and *view-interfaces*.
These are the "moving-parts" of the application and are being digested by the *engine* and a *display-layer*

### View Interfaces
TODO

### Flows
Flows are async functions (or any Promise returning function). \
A flow function will be invoked with a set of utilities (the Toolkit), including the flow's input arguments. \
The Toolkit will contain all the required functions to manage the application's UI, and launch other flows.

### Views
TODO

### Engine
TODO

### Display Layer
TODO

