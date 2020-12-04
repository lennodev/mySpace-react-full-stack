
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs'); // to check if the file exists
const path = require('path'); // to get the current path

// for react read config
require('dotenv').config();

const outputDirectory = './dist/client';

module.exports = (env) => {
  // Get the root path (assuming your webpack config is in the root of your project!)
  const currentPath = path.join(__dirname);

  // Create the fallback path (the production .env)
  const basePath = `${currentPath}/.env`;

  // We're concatenating the environment name to our filename to specify the correct env file!
  const envPath = `${basePath}.${env.ENVIRONMENT}`;

  // Check if the file exists, otherwise fall back to the production .env
  const finalPath = fs.existsSync(envPath) ? envPath : basePath;

  // Set the path parameter in the dotenv config
  const fileEnv = dotenv.config({ path: finalPath }).parsed;

  // reduce it to a nice object, the same as before
  const envKeys = Object.keys(fileEnv).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(fileEnv[next]);
    return prev;
  }, {});

  return {
    target: 'web',
    entry: ['babel-polyfill', './src/client/index.js'],
    output: {
      path: path.join(__dirname, outputDirectory),
      filename: 'bundle-front.js',
      publicPath: '/'
    },
    module: {
      rules: [{
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      }
      ]
    },
    resolve: {
      extensions: ['*', '.js', '.jsx']
    },
    devServer: {
    // historyApiFallback: true,
      port: 3000,
      compress: true,
      open: false
    },
    watchOptions: {
      ignored: ['src/server', 'node_modules/**', 'jest', '__test__']
    },
    plugins: [
      new webpack.DefinePlugin(envKeys), // read config from .env
      // new webpack.EnvironmentPlugin(['REACT_APP_BACKEND_URL', 'REACT_APP_BACKEND_PORT']), // copy .env para for react
      new CleanWebpackPlugin([outputDirectory]),
      new HtmlWebpackPlugin({
        template: './public/index.html'
      }),
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/)
    // new BundleAnalyzerPlugin() // plug-in for analyzer bundle size
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    stats: {
      children: true
    }
  };
};
