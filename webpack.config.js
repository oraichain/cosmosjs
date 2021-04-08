const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        path: path.resolve('dist'),
        filename: 'index.js',
        libraryTarget: 'commonjs2',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        //fallback: { "buffer": false }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: [
                        [
                            require('@babel/preset-typescript'), require('@babel/preset-flow')
                        ]
                    ],
                }
            },
        ]
    },
};