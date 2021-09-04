/*
 * @Author: WouRaoyu
 * @Date: 2021-09-03 09:49:45
 * @LastEditors: WouRaoyu
 * @LastEditTime: 2021-09-03 10:01:18
 * @Description: file content
 */

const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')

let copyPath = ''
let cesiumPath = 'node_modules/cesium/Source'
if (process.env.NODE_ENV === 'production')  {
    cesiumPath = 'node_modules/cesium/Build/Cesium'
    copyPath = 'libs/'
}

const plugins = [
    new webpack.DefinePlugin({CESIUM_BASE_URL: JSON.stringify(copyPath)}),
    new CopyWebpackPlugin([{ from: path.join(cesiumPath, 'Workers'), to: copyPath + 'Workers' }]),
    new CopyWebpackPlugin([{ from: path.join(cesiumPath, 'Assets'), to: copyPath + 'Assets' }]),
    new CopyWebpackPlugin([{ from: path.join(cesiumPath, 'ThirdParty'), to: copyPath + 'ThirdParty' }]),
    new CopyWebpackPlugin([{ from: path.join(cesiumPath, 'Widgets'), to: copyPath + 'Widgets' }])
]

module.exports = {
    publicPath: '/',
    outputDir: 'dist',
    runtimeCompiler: true,
    devServer: {
        open: true,
        host: '0.0.0.0',
        port: 8080,
        https: false,
        hotOnly: false
    },
    configureWebpack: {
        module: {
            unknownContextCritical: false,
        },
        resolve: {
            alias: {
                '@': path.join(__dirname, "src")
            }
        },
        plugins: plugins
    },
};