// @flow
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./configure_store.prod'); // eslint-disable-line global-require
} else {
  module.exports = require('./configure_store.dev'); // eslint-disable-line global-require
}
