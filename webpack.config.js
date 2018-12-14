const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';

const dist = path.join(__dirname, 'dist');

module.exports = {
  entry: {
    main: isDev ? './src/index.js' : './package/index.js',
  },
  mode: process.env.NODE_ENV,
  devtool: isDev ? '#cheap-module-eval-source-map' : false,
  output: {
    // path: dist,
    publicPath: '/',
    libraryTarget: 'umd',
    library: ['schema'],
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              'env',
              'react',
            ],
            plugins: [
              'transform-runtime',
              'transform-class-properties',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
      { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] },
    ],
  },
  plugins: [
    new ExtractTextPlugin('main.css'),
    new HtmlWebpackPlugin({
      template: 'index.html',
      chunks: ['main'],
    }),
  ],
  externals: isDev ? [] : [
    {
      react: {
        commonjs: 'react', commonjs2: 'react', amd: 'react', root: ['React'],
      },
    },
    { 'react-redux': { commonjs: 'react-redux', commonjs2: 'react-redux', amd: 'react-redux' } },
    {
      underscore: {
        commonjs: 'underscore', commonjs2: 'underscore', amd: 'underscore', root: ['_'],
      },
    },
    {
      brace: {
        commonjs: 'brace', commonjs2: 'brace', amd: 'brace', root: ['ace'],
      },
    },
    { moox: { commonjs: 'moox', commonjs2: 'moox', amd: 'moox' } },
    {
      'react-dom': {
        commonjs: 'react-dom', commonjs2: 'react-dom', amd: 'react-dom', root: ['ReactDom'],
      },
    },
    { redux: { commonjs: 'redux', commonjs2: 'redux', amd: 'redux' } },
    { 'prop-types': { commonjs: 'prop-types', commonjs2: 'prop-types', amd: 'prop-types' } },
    { antd: { commonjs: 'antd', commonjs2: 'antd', amd: 'antd' } },
  ],
};
