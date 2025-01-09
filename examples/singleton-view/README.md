# Singleton Views
This app will show us how you can use the same view instance by just passing options parameter to the view function coming from reflow. Showing us that animations are not flickering/stopping or restarting when running child flows that can reuse the same instance of the view. You can see when restarting that the animation is flicking which is normal. When a flow ends, it clears all the views.

As an addition we also have a resetInput option that will reset the input of the view which provides a way to reset the view input when the view is reused, which is useful when you want to reset the view input when the view is reused. Providing some examples below 

Example 1:

```
Simple flow
view(0, views.AnimationTester, {
	theme: currentTheme,
	prop1: 'parentFlow',
}, undefined, {
	singletonView: true
});

Child flow
view(0, views.AnimationTester, {
	theme: 'blue',
	prop1: 'childFlow2',
    props2: 'childFlow2'
}, undefined, {
	singletonView: true
});

Simple flow
view(0, views.AnimationTester, {
	theme: 'red',
	prop1: 'parentFlow',
}, undefined, {
	singletonView: true
});
```

This will work the following way:
1. Simple flow will be rendered with the theme red and prop1 set to parentFlow
2. Child flow will be rendered with the theme blue and prop1 set to childFlow2
3. Simple flow will be rendered with the theme red and prop1 set to parentFlow, but in this case the view input will still keep props2


Example 2:

```
Simple flow
view(0, views.AnimationTester, {
	theme: currentTheme,
	prop1: 'parentFlow',
}, undefined, {
	singletonView: true
});

Child flow
view(0, views.AnimationTester, {
	theme: 'blue',
	prop1: 'childFlow2',
    props2: 'childFlow2'
}, undefined, {
	singletonView: true
});

Simple flow
view(0, views.AnimationTester, {
	theme: 'red',
	prop1: 'parentFlow',
}, undefined, {
	singletonView: true,
    resetInput: true,
});
```

This will work the following way:
1. Simple flow will be rendered with the theme red and prop1 set to parentFlow
2. Child flow will be rendered with the theme blue and prop1 set to childFlow2
3. Simple flow will be rendered with the theme red and prop1 set to parentFlow, but in this case the view input will reset to the default values and props2 will be undefined

## Running
`npm install` \
and \
`npm run start`\
Webpack Dev Server will output the server's address to the console (usually http://localhost:8080) - simply navigate to it via browser 