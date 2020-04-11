// eslint-disable-next-line @typescript-eslint/no-var-requires
const browserify = require('@cypress/browserify-preprocessor');

module.exports = (on) => {
  const browserifyOptions = {
    typescript: require.resolve('typescript'),
  };
  on('file:preprocessor', browserify(browserifyOptions));
};
