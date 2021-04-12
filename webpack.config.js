const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  target: 'web',
  output: {
    path: path.resolve('dist'),
    filename: 'index.js',
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.js', '.json']
    //fallback: { "buffer": false }
  },
  // issue: https://github.com/matthew-andrews/isomorphic-fetch/issues/194#issuecomment-737132024
  externals: {
    'node-fetch': 'commonjs2 node-fetch'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: { compact: false }
      }
    ]
  },
  // maximum 20 MB
  performance: {
    hints: false,
    maxEntrypointSize: 40480000,
    maxAssetSize: 40480000
  },
  plugins: [new BundleAnalyzerPlugin()]
};
