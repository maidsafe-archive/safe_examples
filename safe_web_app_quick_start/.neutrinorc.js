module.exports = {
  use: [
    [
      '@neutrinojs/vue',
      {
        html: {
          title: 'SAFE Web App'
        }
      }
    ],
    (neutrino) => {
      // Override the default development source map of 'cheap-module-eval-source-map'
      // to one that doesn't use `eval` (reduces incremental build performance).
      neutrino.config.devtool('cheap-module-source-map');
    }
  ]
};
