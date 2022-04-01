const currentTask = process.env.npm_lifecycle_event
const path = require("path")
const Dotenv = require("dotenv-webpack")
const {CleanWebpackPlugin} = require("clean-webpack-plugin")
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const fse = require("fs-extra")

class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap("Copy files", function () {
      fse.copySync("./app/assets/fonts", "./dist/assets/fonts")
      fse.copySync("./app/assets/images", "./dist/assets/images")
      fse.copySync("./app/assets/models", "./dist/assets/models")
      fse.copySync("./app/assets/svg", "./dist/assets/svg")
    })
  }
}

//prettier-ignore
const postCSSPlugins = [
  require("postcss-import"),
  require("postcss-simple-vars"),
  require("postcss-nested"),
  require("postcss-extend"),
  require("postcss-color-mod-function"),
  require("autoprefixer")
]

let cssConfig = {
  test: /\.css$/,
  exclude: /(node_modules)/,
  use: [
    {loader: "css-loader", options: {url: false}},
    {loader: "postcss-loader", options: {postcssOptions: {plugins: postCSSPlugins}}}
  ]
}

let config = {
  entry: {
    main: path.resolve(__dirname, "./app/assets/scripts/App.js")
  },
  output: {
    filename: "bundled.js",
    path: path.resolve(__dirname, "app")
  },
  plugins: [
    new Dotenv(),
    new HtmlWebpackHarddiskPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "app/index.html",
      alwaysWriteToDisk: true
    })
  ],
  mode: "development",
  module: {
    rules: [
      cssConfig,
      {
        test: /\.(woff|woff2|eot|ttf|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader"
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      },
      {
        test: /\.glsl$/,
        loader: "webpack-glsl-loader"
      }
    ]
  }
}

if (currentTask == "dev" || currentTask == "webpackDev") {
  cssConfig.use.unshift("style-loader")
  config.devtool = "source-map"
  config.devServer = {
    port: 3000,
    static: path.join(__dirname, "app"),
    hot: true,
    compress: true,
    historyApiFallback: true
  }
}

if (currentTask == "build" || currentTask == "webpackBuild") {
  config.plugins.push(
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({filename: "styles.[chunkhash].css"}),
    new RunAfterCompile(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "app/index.html",
      alwaysWriteToDisk: true
    })
  )
  cssConfig.use.unshift(MiniCssExtractPlugin.loader)
  config.mode = "production"
  config.output = {
    publicPath: "./",
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[chunkhash].js",
    chunkFilename: "[name].[chunkhash].js"
  }
  config.optimization = {
    splitChunks: {chunks: "all"},
    minimize: true,
    minimizer: [`...`, new CssMinimizerPlugin()]
  }
}

module.exports = config
