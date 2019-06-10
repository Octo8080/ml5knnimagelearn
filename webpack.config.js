var webpack = require('webpack');

module.exports = {
  entry: './src/index',
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.ProvidePlugin({
      riot: 'riot'
    })
  ],
  module: {
    rules: [
      { test: /\.js$|\.tag$/, exclude: /node_modules/, loader: 'babel-loader' },
    ]
  },
  devServer: {
    contentBase: './public'
  }
};