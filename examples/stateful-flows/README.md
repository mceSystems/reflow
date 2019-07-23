# stateful-flows
This is a flow-only example, without any views or display layer. It will show how to use the `state` property from the toolkit to retain a state object for a flow.\
As shown in the example the method to retain a state involve the parent flow to re-call the flow "instance" (the `FlowProxy` return from the `flow()` function).

## Running
`npm install` \
and \
`npm run build`\
Then run `node index`