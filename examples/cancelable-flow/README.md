# cancelable-flow
This is a flow-only example, without any views or display layer. It will show how to use the `action()`, `cancel()` and `onCanceled()` functions, how to catch cancellations, and how to make sure a flow can be properly canceled.\
In Reflow, a flow can be canceled. When canceling a flow, a few things happen:
* All flow views, and all child flows' views are removed from the view tree
* All child flows are canceled as well
* The async function it self will continue to run until it reaches a point where the engine is involved, and just stop "going-back" to the flow function. 

See the code and comments in the example for better understanding of the concept

## Running
`npm install` \
and \
`npm run build`\
Then run `node index`