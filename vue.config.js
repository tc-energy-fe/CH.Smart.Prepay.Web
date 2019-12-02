const path = require('path')
const webpack = require('webpack')

module.exports = {
  pages: {
    login: {
      entry: 'src/views/login/login.js',
      template: 'public/login.html',
      filename: 'login.html'
    },
    index: {
      entry: 'src/views/main.js',
      template: 'public/main.html',
      filename: 'index.html',
      title: ''
    }
  },
  productionSourceMap: false,
  configureWebpack: config => {
    return {
      optimization: {
        splitChunks: {
          chunks: 'async'
        }
      },
      // 模块路径解析与alias
      resolve: {
        alias: {
          css: path.resolve(__dirname, 'src/assets/css')
        },
        modules: [path.resolve(__dirname, 'src/components')]
      },
      plugins: [
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
      ]
    }
  }
}
