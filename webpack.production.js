var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    './scripts/index'
  ],
  output: {
    path: __dirname + '/build/',
    filename: 'bundle.js',
    publicPath: '/build/' 
  },
  plugins: [
    new webpack.NoErrorsPlugin(), 
    new webpack.optimize.UglifyJsPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.css']
  },
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['react-hot', 'jsx?harmony'], exclude: /node_modules/ },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
    ]
  },
  amd: { jQuery:true }
};
