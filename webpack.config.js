const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

// Helper to read template files
const readTemplate = (filePath) => {
  try {
    return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
  } catch (err) {
    console.error(`Failed to read template: ${filePath}`, err);
    return '';
  }
};

// Custom plugin to inject templates into index.html after generation
class InjectTemplatesPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('InjectTemplatesPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'InjectTemplatesPlugin',
        (data, cb) => {
          const templates = {
            'page-home': readTemplate('src/templates/pages/home.html'),
            'page-services': readTemplate('src/templates/pages/services.html'),
            'page-quote': readTemplate('src/templates/pages/quote.html'),
            'page-about': readTemplate('src/templates/pages/about.html'),
            'page-contact': readTemplate('src/templates/pages/contact.html'),
            'page-client-login': readTemplate('src/templates/auth/client-login.html'),
            'page-agent-login': readTemplate('src/templates/auth/agent-login.html'),
            'page-client-dashboard': readTemplate('src/templates/dashboards/client-dashboard.html'),
            'page-agent-dashboard': readTemplate('src/templates/dashboards/agent-dashboard.html'),
            'page-admin-dashboard': readTemplate('src/templates/dashboards/admin-dashboard.html'),
          };

          let html = data.html;

          // Inject navbar
          const navbarContent = readTemplate('src/templates/navbar.html');
          const navbarPlaceholder = '<!-- Navigation Bar (injected by Webpack from src/templates/navbar.html) -->';
          html = html.replace(navbarPlaceholder, navbarContent);

          // Inject footer
          const footerContent = readTemplate('src/templates/footer.html');
          const footerPlaceholder = '<!-- Footer (injected by Webpack from src/templates/footer.html) -->';
          html = html.replace(footerPlaceholder, footerContent);

          // Inject each template into its corresponding div
          for (const [id, content] of Object.entries(templates)) {
            const placeholder = `<div id="${id}" class="page-section`;
            const startIndex = html.indexOf(placeholder);
            if (startIndex !== -1) {
              const closeDiv = html.indexOf('</div>', startIndex);
              if (closeDiv !== -1) {
                // Insert content between opening and closing div
                const openingDiv = html.substring(startIndex, html.indexOf('>', startIndex) + 1);
                html = html.substring(0, startIndex + openingDiv.length) +
                  '\n      ' + content + '\n    ' +
                  html.substring(closeDiv);
              }
            }
          }

          data.html = html;
          cb(null, data);
        }
      );
    });
  }
}

module.exports = {
  // Modular ES entry for the vanilla runtime
  entry: './src/core/EntryPointMainApp.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    // Distinctive filename to avoid collisions with other public artifacts
    filename: 'krause.app.js',
    publicPath: '/',
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
      // Process CSS files with style-loader (inlines CSS in JS bundle)
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
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
    static: {
      directory: path.join(__dirname, 'dist'),
      // Helps when working with copied assets (e.g., styles/*) that aren't part of the JS module graph.
      watch: true,
    },
    compress: true,
    // Allow overriding the dev port (avoids EADDRINUSE when 3000 is already taken)
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    historyApiFallback: true,
    devMiddleware: {
      publicPath: '/'
    },
    // Force live-reload when editing static sources (CSS/templates) that may not be imported by JS.
    watchFiles: [
      'styles/**/*',
      'src/templates/**/*',
      'public/**/*'
    ]
  },
  // Use development mode during iterative work; switch to production when ready
  mode: 'development',
  devtool: 'source-map',
  plugins: [
    // Generate index.html with templates injected via custom plugin
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      filename: 'index.html',
      minify: false,
    }),

    // Inject templates into the generated HTML
    new InjectTemplatesPlugin(),

    // Copy static assets (CSS now processed by webpack, not copied)
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/favicon.ico', to: 'favicon.ico' },
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'public/.htaccess', to: '.htaccess', noErrorOnMissing: true },
        { from: 'public/assets', to: 'assets' },
        { from: 'src/api-integration.js', to: 'api-integration.js' },
        { from: 'src/service-worker.js', to: 'service-worker.js', noErrorOnMissing: true },
        { from: 'src/app.js', to: 'app.js', noErrorOnMissing: true },
        { from: 'public/loading.html', to: 'loading.html', noErrorOnMissing: true },
        { from: 'public/admin.html', to: 'admin.html', noErrorOnMissing: true }
      ]
    })
  ],
};