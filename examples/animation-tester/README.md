# Animation
This app will show us how you can use the same view instance by just passing options parameter to the view function coming from reflow. Showing us that animations are not flickering/stopping or restarting when running child flows that can reuse the same instance of the view. You can see when restarting that the animation is flicking which is normal. When a flow ends, it clears all the views.

## Running
`npm install` \
and \
`npm run start`\
Webpack Dev Server will output the server's address to the console (usually http://localhost:8080) - simply navigate to it via browser 