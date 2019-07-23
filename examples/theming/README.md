# theming
This app will demonstrate the viewerParameters concept - how display layer general argument can be controlled from the flow using the `viewerParameters()` functions and the `viewerParameters` option for the `Reflow` engine.
The viewer parameters go to the display layer and its up to it to decide where they go.\
The `@mcesystems/reflow-react-display-layer` takes the viewerParameters and uses them as props to the `Wrapper` component.\
The `Wrapper` component is an optional component that can be passed when initializing `@mcesystems/reflow-react-display-layer`, and it acts as container to the entire display layer. this is mainly useful to use contexts for things like themes.
In this example we'll use a `Wrapper` that simply sets the color of the font of anything in the display layer, rather than use context.

## Running
`npm install` \
and \
`npm run start`\
Webpack Dev Server will output the server's address to the console (usually http://localhost:8080) - simply navigate to it via browser 