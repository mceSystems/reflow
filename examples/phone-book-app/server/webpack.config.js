const path = require("path");

module.exports = {
	entry: "./index.ts",
	output: {
		filename: "worker.js",
		path: path.join(__dirname, "../build/"),
	},
	devtool: "source-map",
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".json"],
	},
	externals: ["socket.io"],
	optimization: {
		minimize: false,
	},
	module: {
		rules: [
			{ test: /\.tsx?$/, loader: "awesome-typescript-loader" },
			{ enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
		],
	},
};
