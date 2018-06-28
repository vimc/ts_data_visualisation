const path = require('path');

module.exports = {
    name: "data_vis",
    entry: "./src/data_vis.ts",
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["*", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    output: {
        filename: "bundle.js",
        path: path.join(__dirname, "out")
    },

    module: {
        rules: [
            // All files with a '.ts' extension will be handled by 'awesome-typescript-loader'.
            // and then fed through Babel to compiled from ES6 to ES5
            {
                test: /\.ts$/,
                loaders: [
                    {
                        loader: "awesome-typescript-loader",
                        options: {
                            useBabel: true,
                            useCache: true
                        }
                    }
                ],
                exclude: [/node_modules/]
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.(html)|(png)|(css)|(svg)$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]"
                }
            }
        ]
    },
    // apparently necessary to get data-forge to compile
    // https://github.com/webpack-contrib/css-loader/issues/447
    node: {
        fs: "empty"
    }
}