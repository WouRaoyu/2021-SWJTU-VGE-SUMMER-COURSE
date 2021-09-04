# __VGE Group 新生研发入门教程__

> 本教程分为三部分，第一部分主要介绍DT平台的研发，包含前端和后端开发的一些基础知识及技巧，包括从开发环境的搭建开始到最终构建一个简单的三维平台；第二部分介绍git的使用，以便于同学们将来在团队协作研发时可以快速上手；第三部分介绍除三维可视化内容外，在后续研发过程同学们可能会使用到的一些用于做模拟分析的第三方开源库，因为这些计算、分析、建模的库以c++语言为主，同时会向大家介绍一些c++开发的经验

## 1. __三维可视化平台开发 [CesiumJS]__

### 开发环境搭建
1. 前端开发需要配置PC端JS运行环境([node.js](https://nodejs.org/zh-cn/))，包管理器([npm](https://www.npmjs.com/))，代码编辑器([vscode](https://code.visualstudio.com/))，浏览器端调试运行环境([chrome](https://www.google.com/intl/zh-CN/chrome/))，npm不需要单独安装，其被包含在node.js安装包中
2. 小组目前大部分平台基于 [Vue 2.x](https://cn.vuejs.org/index.html) + [ElementUI 2.x](https://element.eleme.cn/#/zh-CN) 框架研发，VSCode需要安装Vetur插件来进行语法高亮
3. Vue提供[Vue Cli](https://cli.vuejs.org/zh/)进行Vue项目的快速构建及开发，为PC全局配置Vue Cli
    ``` bash
    npm install -g @vue/cli
    ```
### 初始化平台
1. 使用Vue Cli初始化工程
    ``` bash
    vue create dt-demo
    ```
2. 使用VSCode打开创建好的工程文件夹
3. 命令行使用npm安装基础依赖库[cesium, element-ui, sass, sass-loader]
    ``` bash
    npm install cesium@1.80.0
    npm install element-ui@2.15.0
    npm install sass@1.39.0
    npm install sass-loader@8.0.2
    ```
4. 为工程配置Cesium可视化引擎，在根目录新建vue.config.js文件
    * 方法一：配置node_modules中安装好的cesium
    ``` js
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
    ```
    * 方法二：将打包后的Cesium拷贝到public中以外部库形式直接引入
    ``` html
    <!--修改public文件夹中的index.html文件 在<head>中添加 -->
    <script src="./Cesium/Cesium.js"></script>
    <link rel="stylesheet" type="text/css" href="./Cesium/Widgets/widgets.css"/>
    ```
    ``` js
    const path = require('path')
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
            externals: {
                'Cesium': 'Cesium'
            },
        },
    };
    ```
5. 在main.js中声明全局变量DTGlobe，用于动态存放后续构造的一些需要全局使用的变量，如viewer
    ``` js
    Vue.prototype.DTGlobe = new Array();
    ```
6. 修改工程自动生成的HelloWorld.vue文件，创建Viewer实例，如果要使用Cesium提供的地形及底图服务，需注册并申请[token](https://cesium.com/ion/tokens)
    ``` html
    <template>
        <div style="height: 100%; width: 100%">
            <div id="container" />
        </div>
    </template>

    <script>
    import * as Cesium from "cesium";
    // 如果是直接引入的node_modules中的cesium需要在vue中引入样式 否则不需要
    import 'cesium/Source/Widgets/widgets.css'
    export default {
        beforeMount() {
            this.$nextTick(() => {
                Cesium.Ion.defaultAccessToken = 'token';
                const viewer = new Cesium.Viewer("container");
                this.DTGlobe.push(viewer);
            })
        }
    };
    </script>

    <!-- Add "scoped" attribute to limit CSS to this component only -->
    <style lang="scss" scoped>
    #container {
        height: 100%;
        width: 100%;
    }
    ::v-deep {
        .cesium-viewer-bottom {
            display: none;
        }
    }
    </style>
    ```
7. 调整各页面样式，将三维场景填满整个视窗
    ``` css
    html,
    body,
    #app {
        overflow: hidden;
        height: 100%;
        width: 100%;
        padding: 0;
        margin: 0;
    }
    ```
8. 为平台添加背景图、平台名称、小组Logo
    ``` html
    <div id="background" />
    <div id="title-name"> VGE小组数字孪生测试系统 </div>
    <img id="vge-logo" src="./assets/vge.png" />
    ```
    ``` css
    #background {
        z-index: 9;
        background-image: url('./assets/bg.png');
        pointer-events: none;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        position: absolute;
        height: 100%;
        width: 100%;
    }
    #title-name {
        top: 2vh;
        z-index: 9;
        color: white;
        width: 100%;
        font-size: 4vh;
        font-weight: bold;
        text-align: center;
        position: absolute;
        pointer-events: none;
    }
    #vge-logo {
        z-index: 9;
        width: 8vh;
        height: 8vh;
        left: 2vw;
        bottom: 5vh;
        position: absolute;
    }
    ```
9. 引入ElementUI，可直接引入全部组件也可按需引入
    * 全部引入
    ``` js
    import 'element-ui/lib/theme-chalk/index.css';
    import ElementUI from 'element-ui'
    Vue.use(ElementUI)
    ```
    * 按需引入
    ``` js
    import 'element-ui/lib/theme-chalk/index.css';
    import { NameOfComp } from 'element-ui';
    Vue.use(NameOfComp)
    ```
10. 创建自定义面板

### CesiumJS实例功能
1. [Viewer](https://cesium.com/learn/cesiumjs/ref-doc/Viewer.html) 视图
    ``` js
    // container代表html中提前初始化的id为container的div
    const viewer = new Cesium.Viewer('container', {
        animation: false, // 动画播放器控件
        baseLayerPicker: false, // 图层选择控件
        cesiumLogo: false, // 是否显示cesium图标
        fullscreenButton: false, // 全屏按钮控件
        geocoder: false, // 地名检索控件
        homeButton: false, // home视角按钮控件
        vrButton: false, // vr模式切换按钮控件
        navigationHelpButton: false, // 原生帮助按钮控件
        sceneModePicker: false, // 投影方式选择图标控件
        timeline: false, // 底部时间线
        scene3DOnly: false, // 是否只渲染3D场景
        shouldAnimate: true, // 是否允许动画效果
        infoBox: false, // 属性信息窗口
        shadows: false, // 光照阴影效果
        terrainShadows: Cesium.ShadowMode.ENABLED, // 地形光照阴影
        imageryProvider: Cesium.createWorldImagery(), // 添加全球影像图层
        terrainProvider: Cesium.createWorldTerrain() // 添加全球地形
    })
    ```
2. [Globe](https://cesium.com/learn/cesiumjs/ref-doc/Globe.html) 主体地球
    * [ImageryLayer](https://cesium.com/learn/cesiumjs/ref-doc/ImageryLayer.html) 图层
        * [WebMapServiceImageryProvider](https://cesium.com/learn/cesiumjs/ref-doc/WebMapServiceImageryProvider.html) 加载WMS底图服务
        * [WebMapTileServiceImageryProvider](https://cesium.com/learn/cesiumjs/ref-doc/WebMapTileServiceImageryProvider.html) 加载WMTS底图服务
        * [UrlTemplateImageryProvider](https://cesium.com/learn/cesiumjs/ref-doc/UrlTemplateImageryProvider.html) 加载url模板影像底图（通常用于自定义切片影像）
        * [ArcGisMapServerImageryProvider](https://cesium.com/learn/cesiumjs/ref-doc/ArcGisMapServerImageryProvider.html) ArcGis底图服务（受网络限制有时会很慢）
        * [OpenStreetMapImageryProvider](https://cesium.com/learn/cesiumjs/ref-doc/OpenStreetMapImageryProvider.html) OSM底图服务（受网络限制有时会很慢）
        * [BingMapsImageryProvider](https://cesium.com/learn/cesiumjs/ref-doc/BingMapsImageryProvider.html) Bing底图服务（需要Bing的token）
        * [ImageryLayerCollection](https://cesium.com/learn/cesiumjs/ref-doc/ImageryLayerCollection.html) 图层集合
    ```js
        viewer.imageryLayers // 获取视图对应的图层集合
    ```
    * [Terrain](https://cesium.com/learn/cesiumjs/ref-doc/CesiumTerrainProvider.html) 地形
        * [createWorldTerrain](https://cesium.com/learn/cesiumjs/ref-doc/global.html?classFilter=glob#createWorldTerrain) 创建全球地形（需要Cesium的token）
        * [sampleTerrain](https://cesium.com/learn/cesiumjs/ref-doc/global.html?classFilter=Terrain#sampleTerrain) or [sampleTerrainMostDetailed](https://cesium.com/learn/cesiumjs/ref-doc/global.html?classFilter=Terrain#sampleTerrainMostDetailed) 地面点批量采样
        * [Globe#getHeight](https://cesium.com/learn/cesiumjs/ref-doc/Globe.html#getHeight) 获取地面高度 
        * [Globe#pick](https://cesium.com/learn/cesiumjs/ref-doc/Globe.html#pick) 获取射线与地面交点
    ```js
        viewer.terrainProvider // 获取视图对应的地形（唯一）
    ```
3. [Camera](https://cesium.com/learn/cesiumjs/ref-doc/Camera.html) 相机
    * [flyTo](https://cesium.com/learn/cesiumjs/ref-doc/Camera.html#flyTo) 飞行到视点
    * [setView](https://cesium.com/learn/cesiumjs/ref-doc/Camera.html#setView) 设置相机视点
    * [lookAt](https://cesium.com/learn/cesiumjs/ref-doc/Camera.html#lookAt) 相机看向目标位置
    * [lookAtTransform](https://cesium.com/learn/cesiumjs/ref-doc/Camera.html#lookAtTransform) 通过旋转矩阵设置看向目标
    * [Viewer#zoomTo](https://cesium.com/learn/cesiumjs/ref-doc/Viewer.html#zoomTo) 视图缩放至匹配位置
    * 沿路径漫游，flyTo函数和Callback组合实现
    * 绕点飞行，lookAt函数和Clock组合实现

4. [Entity](https://cesium.com/learn/cesiumjs/ref-doc/Entity.html) 实例 </br> 可以直接绑定CallbackProperty做动态及交互式功能比较友好
    * 点状
        * [PointGraphics](https://cesium.com/learn/cesiumjs/ref-doc/PointGraphics.html) 点
        * [BillboardGraphics](https://cesium.com/learn/cesiumjs/ref-doc/BillboardGraphics.html) 标牌
        * [LabelGraphics](https://cesium.com/learn/cesiumjs/ref-doc/LabelGraphics.html) 标签
    * 线状
        * [PolylineGraphics](https://cesium.com/learn/cesiumjs/ref-doc/PolylineGraphics.html) 折线
    * 面状
        * [PlaneGraphics](https://cesium.com/learn/cesiumjs/ref-doc/PlaneGraphics.html) 平面
        * [RectangleGraphics](https://cesium.com/learn/cesiumjs/ref-doc/RectangleGraphics.html) 长方形面 
        * [PolygonGraphics](https://cesium.com/learn/cesiumjs/ref-doc/PolygonGraphics.html) 多边形面
        * [EllipseGraphics](https://cesium.com/learn/cesiumjs/ref-doc/EllipseGraphics.html) 椭圆面
        * [WallGraphics](https://cesium.com/learn/cesiumjs/ref-doc/WallGraphics.html) 垂直连接面
    
    * 体状
        * [BoxGraphics](https://cesium.com/learn/cesiumjs/ref-doc/BoxGraphics.html) 盒体
        * [CylinderGraphics](https://cesium.com/learn/cesiumjs/ref-doc/CylinderGraphics.html) 锥柱体
        * [PolylineVolumeGraphics](https://cesium.com/learn/cesiumjs/ref-doc/PolylineVolumeGraphics.html) 沿线扫掠体
        * [PolygonGraphics Extruded](https://cesium.com/learn/cesiumjs/ref-doc/PolygonGraphics.html#extrudedHeight) 多边形拉伸体
        * [EllipseGraphics Extruded](https://cesium.com/learn/cesiumjs/ref-doc/EllipseGraphics.html#extrudedHeight) 椭圆面拉伸体
        
    * 模型（较少使用，通常使用Primitive来加载模型）
        * [ModelGraphics](https://cesium.com/learn/cesiumjs/ref-doc/ModelGraphics.html) glTF模型
        * [Cesium3DTilesetGraphics](https://cesium.com/learn/cesiumjs/ref-doc/Cesium3DTilesetGraphics.html) 3DTiles模型(基于glTF的封装)

    * [EntityCollection](https://cesium.com/learn/cesiumjs/ref-doc/EntityCollection.html) 实例集合
    ```js
        viewer.entities // 获取视图对应的实例集合
    ```
5. [Primitive](https://cesium.com/learn/cesiumjs/ref-doc/Primitive.html) 图元 </br> 与Entity相比，Primitive更加底层，可以实现的效果更丰富
    * 模型（通常使用Primitive来加载模型）
        * [Model](https://cesium.com/learn/cesiumjs/ref-doc/Model.htmL) glTF模型
        * [Cesium3DTileset](https://cesium.com/learn/cesiumjs/ref-doc/Cesium3DTileset.html) 3DTiles模型
            * [modelMatrix](https://cesium.com/learn/cesiumjs/ref-doc/Cesium3DTileset.html?#modelMatrix) [Tile#transform](https://cesium.com/learn/cesiumjs/ref-doc/Cesium3DTile.html?#transform) 位姿调整
            * [Cesium3DTileFeature](https://cesium.com/learn/cesiumjs/ref-doc/Cesium3DTileFeature.html) 属性查询
            * [Cesium3DTileStyle](https://cesium.com/learn/cesiumjs/ref-doc/Cesium3DTileStyle.html) 显示样式
            * [clippingPlanes](https://cesium.com/learn/cesiumjs/ref-doc/Cesium3DTileset.html?#clippingPlanes) 模型剖切
    * [PrimitiveCollection](https://cesium.com/learn/cesiumjs/ref-doc/PrimitiveCollection.html) 图元集合
    ```js
        viewer.primitives // 获取视图对应的图元集合
    ```

6. [CallbackProperty](https://cesium.com/learn/cesiumjs/ref-doc/CallbackProperty.html) 回调属性
    * 使用回调属性可以实现很多动态效果及功能
        * 动态标绘
        * 动态剖切
        * 实时交互
        * ......

7. [ScreenSpaceEventHandler](https://cesium.com/learn/cesiumjs/ref-doc/ScreenSpaceEventHandler.html) 交互事件
    * [ScreenSpaceEventType](https://cesium.com/learn/cesiumjs/ref-doc/global.html?#ScreenSpaceEventType)交互事件类型
    ``` js
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement) => {
        ...
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    ```
8. __组合功能讲解__
    * 沿路径漫游
    * 绕点飞行
    * 动态标绘
    * 属性弹窗

### 后端服务功能开发
1. 为什么需要后端服务？
    * 响应前端的个性化请求
    * 存储动态数据

2. 后端服务和Apache/Nginx的区别
    * 服务是定制化的，可以根据请求动态返回数据，Apache等软件则是静态的服务器容器，其提供静态文件的挂载传输功能，但是本身不具备动态响应能力（可以通过一些插件的形式扩展）

3. 使用node.js + express框架快速搭建服务
    ```js
    const express = require("express")
    const path = require("path")
    const app = express();

    app.listen(8088, () => {
        console.log("App listening at port 8088\n http://localhost:8088 ")
    })
    ```
4. 监听网络请求
    ``` js
    // 监听GET请求
    app.get('path', (request，response) => {
        ...
    });
    // 监听POST请求
    app.post('path', (request，response) => {
        ...
    });
    ```
5. 设置静态挂载目录
    ``` js
    app.use(express.static(path.join(__dirname, '')));
    ```
6. 实际案例讲解
    * 漫游路径存档
    * 标绘几何存档
    * 前端访问存档数据

## 2. __使用git进行团队协作__
### 安装配置[git](https://git-scm.com/)环境

### git相关命令
1. 本地初始化git仓库
    ``` bash
    git init
    ```
2. 从远程克隆git仓库到本地
    ``` bash
    git clone url_to_repo
    ```
3. git分支相关内容
    * 创建新的分支
    ``` bash
    git checkout -b branch_name
    ```
    * 切换到分支
    ``` bash
    git checkout branch_name
    ```
    * 删除分支
    ``` bash
    git branch -d branch_name
    git branch -D branch_name # 强制删除分支
    ```
    * 查看分支
    ``` bash
    git branch -a # 查看包括远程仓库中的所有分支
    git branch -l # 查看本地所有分支
    ```
4. 添加要提交的变更文件
    ``` bash
    git add path_to_dir/path_to_file
    ```
5. 提交变更到仓库
    ``` bash
    git commit -m "message of description for this commit"
    ```
6. 上传变更到远程仓库某一分支
    ``` bash
    git push origin branch_name
    ```
7. 同步某分支远程代码到本地
    ``` bash
    git fetch origin branch_name
    ``` 
8. 拉取同时合并某一分支最新代码
    ``` bash
    git pull origin branch_name
    ```
9. 代码合并
    ``` bash
    git merge
    ```
    使用VSCode或GitKraken检查合并冲突代码
10. 远程仓库相关内容
    * 添加远程仓库关联到本地仓库
    ``` bash
    git remote add short_name url
    ```
    * 移除远程仓库关联
    ``` bash
    git remote remove short_name
    ```
    * 查看远程仓库关联情况
    ``` bash
    git remote show short_name
    ```
### 使用[github](https://github.com/)远程托管代码
1. [创建自己的仓库](https://docs.github.com/cn/github/getting-started-with-github/quickstart/create-a-repo)
2. fork别人的仓库
3. 为本地git添加github账号邮箱
    ``` bash
    git config --global user.name "username"
    git config --global user.email "email"
    ```
4. 申请github访问[token](https://github.com/settings/tokens)

## 3. __GIS相关第三方开源库__
### 相关开源库简介
1. GDAL (Geospatial Data Abstraction Library) https://gdal.org
2. CGAL (Computational Geometry Algorithms Library) https://www.cgal.org
3. OCCT (Open CASCADE Technology) https://www.opencascade.com

### 使用Anaconda搭建开发环境
1. 直接在命令行中配置
    ``` bash
    conda config --add channels conda-forge
    conda create -n gisenv
    conda install cmake
    conda install cgal
    conda install gdal
    conda install occt
    ```
2. 使用配置文件
    ``` yml
    channels:
        - conda-forge
        - defaults

    dependencies:
        - cgal
        - cmake
        - gdal
        - occt
    ```

    ``` bash
    conda env create -n gisenv -f file_name.yml
    ```
3. 将环境目录添加到系统PATH目录中

### 使用CMake管理工程
1. 编写CMakeLists.txt配置文件
    ```cmake
    cmake_minimum_required(VERSION 3.1)
    project(GISTutorial)

    set(CMAKE_CXX_STANDARD 11)
    set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/bin)
    set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/lib)
    set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/lib)
    set(CMAKE_MODULE_PATH "${CMAKE_MODULE_PATH};${CMAKE_CURRENT_SOURCE_DIR}/cmake")

    file(GLOB SRC "source/*.h" "source/*.cpp")
    add_executable(UseSample ${SRC})
    target_link_libraries(UseSample ${LIBRARIES})
    ```
2. 使用Anaconda命令行配置工程
    ```
    conda activate gisenv
    mkdir build
    cd build
    cmake -G "Visual Studio 16 2019" -A "x64"  ^
        -DCMAKE_PREFIX_PATH=%CONDA_PREFIX% ^
        ../
    ```

<center>* Copyright (c) 2021 SWJTU VGE GROUP</center>
<center>* Author: WouRaoyu</center>
<center>* LastEditors: WouRaoyu</center>