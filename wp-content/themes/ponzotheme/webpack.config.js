// webpack and plugins
const path = require('path')
const webpack = require('webpack')
// watch files
const chokidar = require('chokidar')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
// needs to be a curly
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// config file
const config = require('./config.json')
//creates an absolute outputpath within your app, like app/dist
const OUTPUT_DIR = `${__dirname}/${config.appfolder}/${config.outputfolder}`

module.exports = (env, argv) => {
  //set modes -- use devMode for testing, adds testMode for npm run test
  let devMode = true
  let testMode = false
  if (argv.mode === 'production') devMode = false
  else if (argv.mode === 'none') testMode = true
  //set entries from config
  let entries = {
    bundle: config.entry.script,
    main: config.entry.style
  }
  //adds a gutenberg script for production (same scss file but with #gutenberg prefix)
  if (!devMode) {
    entries.gutenberg = config.entry.gutenberg
  } else {
  }
  // some fixes for the devserver proxy
  entries.devserver = './devserver.js'
  //return webpack config
  return {
    devtool: devMode ? 'source-map' : 'none',
    entry: entries,
    output: {
      path: OUTPUT_DIR,
      //parent folder src for production assets
      publicPath: devMode ? '/' : '../',
      filename: devMode ? 'scripts/[name].js' : 'scripts/[name].[hash].js'
    },
    //split vendor chunk for caching
    optimization: {
      splitChunks: {
        chunks: 'all',
        automaticNameDelimiter: '-',
        name: 'vendor'
      }
    },
    module: {
      rules: [
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.(html)$/,
          exclude: /node_modules/,
          use: {
            loader: 'html-loader',
            options: { minimize: true }
          }
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]'
            }
          }
        },
        {
          test: /\.s?css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                // enable hot!
                hmr: devMode,
                // if hmr does not work, this is a forceful method.
                reloadAll: true
              }
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: devMode
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: devMode
                // optional vars
                // data: '$env: 'production';'
              }
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: ['*', '.js'],
      //create an alias for base/scripts
      alias: { base: path.resolve(__dirname, './src/scripts') }
    },
    plugins: [
      //pass proxy target as CONSTANT
      new webpack.DefinePlugin({
        PROXYTARGET: JSON.stringify(config.proxytarget),
        PORT: JSON.stringify(config.port)
      }),
      new webpack.HotModuleReplacementPlugin(),
      //creates a manifest
      new ManifestPlugin({
        fileName: 'manifest.json',
        map: file => {
          if (!devMode) {
            // remove .. double dots within file paths
            file.path = file.path.replace(/(\.\.)/g, '')
          }
          return file
        }
      }),
      new MiniCssExtractPlugin({
        filename: devMode ? '[name].css?[hash]' : 'styles/[name].[hash].css',
        chunkFilename: devMode ? '[id].css' : 'styles/[id].[hash].css'
      }),
      //clean dist folder, also in development mode (no dist bundles are pulled)

      new CleanWebpackPlugin({
        cleanAfterEveryBuildPatterns: [config.outputfolder]
      }),

      /* or clean only on production
      // clean outputfolder on production

      ...(devMode
        ? []
        : [
            new CleanWebpackPlugin({
              cleanAfterEveryBuildPatterns: [config.outputfolder]
            })
          ]),
        */
      // loads index.html for testing purpose
      ...(!testMode
        ? []
        : [
            new HtmlWebpackPlugin({
              template: __dirname + '/test/index.html',
              filename: './index.html'
            })
          ])
    ],
    devServer: {
      historyApiFallback: true,
      compress: true,
      port: config.port,
      hot: true,
      //hotOnly: true,
      open: true,
      liveReload: true,
      //pull directly from content base
      contentBase: OUTPUT_DIR,
      overlay: {
        errors: true,
        warnings: false
      },
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      //proxy target
      proxy: {
        '/': {
          target: config.proxytarget,
          secure: false,
          changeOrigin: true,
          autoRewrite: true
        }
      },
      //watch php / twig files or whatever in the config files
      before(app, server) {
        const files = config.watch
        chokidar
          .watch(files, {
            alwaysStat: true,
            atomic: false,
            followSymlinks: false,
            ignoreInitial: true,
            ignorePermissionErrors: true,
            persistent: true,
            usePolling: true
          })
          .on('all', () => {
            server.sockWrite(server.sockets, 'content-changed')
          })
      }
    }
  }
}
