function commonConfig() {
    return {
        devtool: "source-map",
        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: ["*", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
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
        }
    }
}

module.exports = {
    commonConfig: commonConfig
};