var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: {
    background: path.resolve(__dirname, 'app', 'scripts.babel', 'background.js'),
    popup: path.resolve(__dirname, 'app', 'scripts.babel', 'popup.js')
  },
  output: {
    path: path.resolve(__dirname, 'app', 'scripts'),
    publicPath: '/scripts',
    filename: '[name].js',
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
  resolve: {
    root: path.resolve(__dirname, 'node_modules'),
    extensions: ['', '.js', '.css', '.vue']
  },
  module: {
    loaders: [{
      test: /\.vue$/,
      loader: 'vue'
    }, {
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
    }, {
      test: /\.json$/,
      loader: 'json'
    }, {
      test: /\.(png|jpg|gif|svg)$/,
      loader: 'url',
      query: {
        limit: 10000,
        name: '[name].[ext]?[hash]'
      }
    }, {
      test: /\.css$/,
      loader: 'style!css'
    }]
  },
  //watch: true,
  externals: {
    'jquery': 'jQuery'
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    })
  ],
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  devtool: 'source-map'
};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = 'source-map';
  module.exports.watch = false;
  // http://vuejs.github.io/vue-loader/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin()
  ]);
}
