<!--
 * @Author: WouRaoyu
 * @Date: 2021-09-03 09:27:23
 * @LastEditors: WouRaoyu
 * @LastEditTime: 2021-09-04 16:36:53
 * @Description: file content
-->
<template>
  <div id="container" />
</template>

<script>
import * as Cesium from "cesium";
import "cesium/Source/Widgets/widgets.css";
export default {
  name: "HelloWorld",
  methods: {},
  computed: {},
  mounted() {
    Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0OGE4M2RiOC1kY2M2LTQ0MDktODFmYi1hMjY2M2RmMTA1MWUiLCJpZCI6MjA2NjYsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzgwNDI3MjB9.h2HY9_TaXGOgdtiQ2TivE1ScYyjsNOvtU0TVxQeP9lE";
    const viewer = new Cesium.Viewer("container", {
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
      terrainProvider: Cesium.createWorldTerrain(), // 添加全球地形
    });

    // 鼠标针对地形的操作一定要开启深度检测
    viewer.scene.globe.depthTestAgainstTerrain = true

    this.DTGlobe.push(viewer);
  },
  created() {},
  beforeMount() {},
  destroyed() {},
  activated() {},
  deactivated() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
#container {
  width: 100%;
  height: 100%;
}
::v-deep {
  .cesium-viewer-bottom {
    display: none;
  }
}
</style>
