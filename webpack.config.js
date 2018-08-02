const path = require('path'),
helper = require("./webpack.common");

function makeConfig() {
        return Object.assign({
            mode: "production",
            name: "data_vis",
            entry: "./src/data_vis.ts",

            output: {
                filename: "bundle.js",
                path: path.join(__dirname, "out")
            },

            // apparently necessary to get data-forge to compile
            // https://github.com/webpack-contrib/css-loader/issues/447
            node: {
                fs: "empty"
            }
        }, helper.commonConfig())

}
module.exports = makeConfig();