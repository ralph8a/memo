const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Use the app entry that mounts into #root so the bundle actually renders
  // the React tree. Previously this pointed at the component only which
  // produced a bundle that didn't call createRoot -> blank page.
  entry: './src/main.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/memo/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // allow importing images as files (emit to output and return URL)
      {
        test: /\.(svg|jpg|jpeg|png|gif)$/i,
        type: 'asset/resource'
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 3000,
    historyApiFallback: true,
    // ensure the dev middleware serves assets under the same publicPath
    // used for production builds (output.publicPath = '/memo/').
    devMiddleware: {
      publicPath: '/memo/'
    }
  },
  // production build: optimized output and generated index.html
  mode: 'production',
  devtool: false,
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Guillermo Krause - Contact Card',
      filename: 'card.html',
      // ensure correct base when served from GitHub Pages repo subpath
      templateContent: ({ htmlWebpackPlugin }) => `<!doctype html><html lang="en"><head><base href="/memo/"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#a02c5a"><meta name="description" content="Professional contact card for Guillermo Krause Sepulveda - Krause Insurance"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="Contact Card"><link rel="icon" type="image/svg+xml" href="icon.svg"><link rel="icon" type="image/x-icon" href="favicon.ico"><link rel="manifest" href="manifest.json"><title>${htmlWebpackPlugin.options.title}</title></head><body><div id="root"></div></body></html>`
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets/icon.svg', to: 'icon.svg' },
        { from: 'src/assets/favicon.ico', to: 'favicon.ico' },
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'src/service-worker.js', to: 'service-worker.js' },
        { from: 'app.html', to: 'app.html' },
        { from: 'app.css', to: 'app.css' },
        { from: 'acrylic.css', to: 'acrylic.css' },
        { from: 'app.js', to: 'app.js' },
        { from: 'splash.html', to: 'index.html' }
      ]
    })
  ],
};