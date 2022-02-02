const path = require('path');
const webpack = require('webpack');

const commonConfig = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime'],
            compact: false
          }
        }
      }
    ]
  },
  // maximum 20 MB
  performance: {
    hints: false,
    maxEntrypointSize: 40480000,
    maxAssetSize: 40480000
  }
};

const nodeConfig = {
  mode: 'production',
  entry: './src/index.js',
  target: 'node',
  output: {
    path: path.resolve('dist'),
    filename: 'index.js',
    globalObject: 'this',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js', '.json']
    //fallback: { "buffer": false }
  },
  // issue: https://github.com/matthew-andrews/isomorphic-fetch/issues/194#issuecomment-737132024
  externals: {
    'node-fetch': 'commonjs2 node-fetch'
  },
  ...commonConfig
};

const webConfig = {
  mode: 'production',
  entry: './src/index.js',
  target: 'web',
  output: {
    path: path.resolve('dist'),
    filename: 'index.web.js',
    globalObject: 'this',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js', '.json']
    //fallback: { "buffer": false }
  },
  ...commonConfig
};

module.exports = [nodeConfig, webConfig];
