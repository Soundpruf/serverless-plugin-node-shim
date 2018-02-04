const path = require("path");
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");

const entries = Object.keys(slsw.lib.entries).reduce((memo, entry) => {
  return {
    ...memo,
    [entry]: [
      "file-loader?name=node-v9.5.0-linux-x64/bin/node!./node-v9.5.0-linux-x64/bin/node",
      `./${entry}`
    ]
  };
}, {});

module.exports = {
  bail: true,
  target: "node",
  entry: entries,
  resolve: {
    extensions: [".js"]
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js"
  },
  externals: [nodeExternals()]
};
