const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/background/background.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'background.js',
    iife: false
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                target: 'es5',
                module: 'commonjs'
              }
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts']
  },
  optimization: {
    minimize: false
  }
}; 