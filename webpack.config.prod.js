const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv').config(),
    env = process.env;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: __dirname + "/app/index.js",

    output: {
        path: path.resolve(__dirname + '/public/assets/'),
        filename: '[name][hash].js',
        chunkFilename: '[id].chunk.js',
        publicPath: '/assets/',
    },
    resolve: {
        extensions: [" ", ".js", ".jsx", ".css", ".less", ".json", ".html"],
    },

    plugins: [
        new CleanWebpackPlugin(['public/assets']),
        new HtmlWebpackPlugin({
            title: 'MultiSensor: prod',
            filename: path.resolve(__dirname, 'public/index-prod.html'),
            inject: true,
            template: path.resolve(__dirname, 'public/index-tpl.html')
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production'),
                'PUBLIC_URL': JSON.stringify(env.HOST),
                'DEVICE_URL': JSON.stringify(env.DEVICE_URL),
                'GEOLOCATION': JSON.stringify(env.GEOLOCATION),
                'API_KEY'   : JSON.stringify(env.API_KEY)
            }
        }),
        new webpack.ProvidePlugin({
            'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
        }),
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compressor: {
                warnings: false,
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/, /vendors/],
                loader: require.resolve('babel-loader'),
                options: {
                    babelrc: true,
                    cacheDirectory: false
                }
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
                test: /\.(woff|woff2|eot|ttf|otf)$/, use:[{loader: "file-loader"}]
            },
            {
                test: /\.(png|svg|jpg|gif)$/, use:[{loader: "file-loader"}]
            }

        ],

    },
};
