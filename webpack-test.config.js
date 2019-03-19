const helper = require("./webpack.common");
//const nodeExternals = require('webpack-node-externals');

// module.exports = Object.assign({
//     name: "test",
//     mode: "development",
//     target: 'node', // in order to ignore built-in modules like path, fs, etc.
//     externals: [ nodeExternals() ], // in order to ignore all modules in node_modules folder

// }, helper.commonConfig());

var nodeExternals = require('webpack-node-externals');
var isCoverage = process.env.NODE_ENV === 'coverage';
var path = require('path');

module.exports = Object.assign({
  name: "test",
  mode: "development",
  output: {
    // use absolute paths in sourcemaps (important for debugging via IDE)
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  },
  module: {
    rules: [].concat(
      isCoverage ? {
          test: /\.(js|ts)/,
          include: path.resolve('src'),
          enforce: 'post',
          loader: 'istanbul-instrumenter-loader'
      }: [],
      {
          test: /.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader',
      },
      {
          test: /\.ts$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'ts-loader'
      }
    ),
    // ...
  },
  target: 'node',  // webpack should compile node compatible code
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  devtool: 'inline-source-map'
}, helper.commonConfig());