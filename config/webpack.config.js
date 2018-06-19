var helpers = require('./helpers');
const webpack = require('webpack');
var validator = require('webpack-validator');
const cleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = validator({
	entry: {
	  app: './src/app/app.js',
	  vendor: './src/vendor.js'
	},
	output: {
		filename: '[name].[chunkhash].js',
		path: helpers.absolutePath('build')
	},

	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /(node_modules)/,
				query: {
					presets: 'es2015'
				}
			},

			{
				test: /\.js$/,
				loader: 'eslint-loader',
				exclude: /(node_modules)/,
				query: {
					configFile: './config/eslintrc.json'
				}
			},

			{
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract('style-loader', 'css-loader'),
				exclude: /(node_modules)/
			},

			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			},

			{
    		test: /\.(jpe?g|png|gif|svg|eot|woff|ttf|svg|woff2)$/,
    		loader: "file-loader?name=[name].[ext]"
      },

			{
				test: /\.html$/,
				loader: 'raw-loader',
				exclude: [helpers.absolutePath('src/index.html')]
			}
		]
	},

	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			inject: 'body'
		}),
		new cleanWebpackPlugin(['build'], {
			root: helpers.absolutePath(''),
			varbose: true
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: ['vendor', 'manifest']
		}),
		new ExtractTextPlugin('[name].[chunkhash].css')
	],

	devServer: {
		port: 3000,
		host: 'localhost',

		historyApiFallback:true,
		watchOptions: {
			aggregateTimeout: 300
		},
    proxy: {
      "/scripts": {
        target: "http://localhost/scheduler-app_scripts",
        changeOrigin: true,
        pathRewrite: {
          '^/scripts': ''
        }
      },
			"/ext": {
        target: "http://localhost/external_modules",
        changeOrigin: true,
        pathRewrite: {
          '^/ext': ''
        }
      }
    },
		stats: 'errors-only',
    //security: false
	}
});
