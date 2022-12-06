const path = require("path");

module.exports = {
	entry: "./index.ts",
	output: {
		filename: "bundle.js",
		path: __dirname,
	},
	devtool: "source-map",
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".json"],
	},
	externals: ["socket.io", "http"],
	optimization: {
		minimize: false,
	},
	devServer: {
		static: {
			directory: __dirname
		},
		client: {
			overlay: false
		}
	},
	module: {
		rules: [
			{ test: /\.tsx?$/, loader: "ts-loader" },
		],
	},
};
