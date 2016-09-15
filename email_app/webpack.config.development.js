/* eslint max-len: 0 */
import webpack from 'webpack';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';

const port = process.env.PORT || 3000;

export default merge(baseConfig, {
  debug: true,

  devtool: 'cheap-module-eval-source-map',

  entry: [
    `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
    './app/index'
  ],

  output: {
    publicPath: `http://localhost:${port}/dist/`
  },

  module: {
    loaders: [
      {
        test: /\.less$/,
        loader: "style!css!less"
      },
      { test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/, loader: 'file-loader?name=fonts/[name].[ext]' }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],

  target: 'electron-renderer'
});
