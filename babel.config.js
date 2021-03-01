/* eslint global-require: off */

module.exports = (api) => {
  api.cache(true);
  return {
    presets: [require('@babel/preset-env'), require('@babel/preset-flow')],
    plugins: ['@babel/plugin-transform-runtime'],
    overrides: [
      {
        test: './src/messages',
        compact: true
      }
    ]
  };
};
