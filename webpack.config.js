const webpack = require('webpack');
const dotenv = require('dotenv').config(),
      env = process.env;
const { resolve } = require('path');
const hmr = [
    'babel-polyfill',
];
module.exports = {
    devtool: 'source-map',

    entry: {
        main: hmr.concat(['./app/index.js'])
    },
    output: {
        path: resolve(__dirname + '/app/'),
        filename: 'index.js',
        chunkFilename: '[id].chunk.js',
        publicPath: '/app/',
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/, /.+\.config.js/, /vendor/, /server\/data/],
                loader: require.resolve('babel-loader'),
                options: {
                    babelrc:true,
                    cacheDirectory: true,
                    plugins: [
                        "transform-runtime",
                        "transform-decorators-legacy",
                        "transform-class-properties",
                        // "react-hot-loader/babel"
                    ],
                    presets: [ ["env", {"modules": false}], "react", "stage-0"]
                }
            },

            {
                test: /\.html$/,
                loader: 'file-loader?name=[name].[ext]',
            },
            {
                test: /\.json$/, loader: "json-loader"
            },
            {
                test: /\.css$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "less-loader" // compiles Less to CSS
                }]
            },
            {
                test: /\.less$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "less-loader" // compiles Less to CSS
                }]
            },
            {
                test: /\.gif$/, use:[{loader: "url-loader?mimetype=image/png"}]
            },
            {
                test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/, use:[{loader: "url-loader?mimetype=application/font-woff"}]
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/, use:[{loader: "file-loader?name=[name].[ext]"}]
            }

        ],

    },

    resolve: {
        extensions: [" ",".js", ".jsx", ".css", ".less", ".json"],
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin({
            'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('development'),
                'PUBLIC_URL': JSON.stringify(env.HOST),
                'DEVICE_URL': JSON.stringify(env.DEVICE_URL),
                'GEOLOCATION': JSON.stringify(env.GEOLOCATION),
                'API_KEY'   : JSON.stringify(env.API_KEY)
            }
        })
    ]
};
