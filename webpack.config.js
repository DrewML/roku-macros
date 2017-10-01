const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.join(__dirname, 'client/index.js'),
    output: {
        path: path.join(__dirname, 'client/dist'),
        filename: 'bundle.js',
        publicPath: 'assets'
    },
    resolve: {
        alias: {
            components: path.join(__dirname, 'client/components')
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['react']
                }
            }
        ]
    },
    plugins: [
        new HTMLWebpackPlugin({
            title: 'Roku Macros',
            template: path.join(__dirname, 'client/index.html')
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        })
    ]
};
