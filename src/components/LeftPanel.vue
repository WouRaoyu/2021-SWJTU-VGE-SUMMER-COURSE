<!--
 * @Author: WouRaoyu
 * @Date: 2021-09-03 10:49:02
 * @LastEditors: WouRaoyu
 * @LastEditTime: 2021-09-04 17:09:52
 * @Description: file content
-->

<template>
  <div class="left-panel">
    <h2 style="color: white">Left Panel</h2>
    <el-menu @select="handleSelect" background-color="#000" text-color="#fff">
      <el-submenu index="0">
        <template slot="title">
          <i class="el-icon-location"></i>
          <span>Camera相关操作</span>
        </template>
        <el-menu-item-group>
          <el-menu-item
            v-for="(item, i) in list1"
            :index="'0-' + i"
            :key="'0-' + i"
          >
            <div>{{ item }}</div>
          </el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="1">
        <template slot="title">
          <i class="el-icon-location"></i>
          <span>绘制实例</span>
        </template>
        <el-menu-item-group>
          <el-menu-item
            v-for="(item, i) in list2"
            :index="'1-' + i"
            :key="'1-' + i"
          >
            <div>{{ item }}</div>
          </el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="2">
        <template slot="title">
          <i class="el-icon-location"></i>
          <span>动态标绘</span>
        </template>
        <el-menu-item-group>
          <el-menu-item
            v-for="(item, i) in list3"
            :index="'2-' + i"
            :key="'2-' + i"
          >
            <div>{{ item }}</div>
          </el-menu-item>
        </el-menu-item-group>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
import axios from "axios";
import * as Cesium from "cesium";
import { ArroundPointRoam } from "../utils/ArroundPointRoam.js";
import { PolygonDrawer } from "../utils/PolygonDrawer.js";
import { mapMutations, mapState } from "vuex";
import { RoamControl, getCameraViewPoint } from "../utils/FollowPathRoam.js";

export default {
  data() {
    return {
      itr: 0,
      roaming: false,
      list1: [
        "视角跳转",
        "视角飞行",
        "相机看向目标",
        "解除目标锁定",
        "绕点飞行",
        "路径漫游",
      ],
      list2: ["多边形", "多边形贴地", "拉伸多边形", "不封闭的拉伸多边形"],
      list3: ["绘制多边形", "选择多边形", "编辑多边形", "数据上传"],
    };
  },
  computed: {
    ...mapState(["dataUpdate"]),
  },
  methods: {
    ...mapMutations(["update"]),
    handleSelect(index, _) {
      // this.$store;
      // this.$store.commit("", );
      this.update();
      const viewer = this.DTGlobe[0];
      if (index === "0-0") {
        this.DTGlobe[0].camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(-117.16, 32.71, 15000.0),
        });
      } else if (index === "0-1") {
        this.DTGlobe[0].camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(-117.16, 32.71, 15000.0),
        });
      } else if (index === "0-2") {
        var center = Cesium.Cartesian3.fromDegrees(-98.0, 40.0);
        this.DTGlobe[0].camera.lookAt(
          center,
          new Cesium.Cartesian3(0.0, -4790000.0, 3930000.0)
        );
      } else if (index === "0-3") {
        this.DTGlobe[0].camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      } else if (index === "0-4") {
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        let roam = new ArroundPointRoam(viewer);
        handler.setInputAction((clk) => {
          const pos = viewer.scene.pickPosition(clk.position);
          console.log(pos);
          let initview = {
            position: viewer.camera.position,
            orientation: {
              heading: viewer.camera.heading,
              pitch: viewer.camera.pitch,
            },
          };
          roam.stop();
          if (Cesium.defined(pos)) {
            roam.create({
              center: pos,
              duration: 10,
              initview,
            });
            roam.start();
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction((clk) => {
          roam.stop();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      } else if (index === "0-5") {
        let res = new Array();
        let roam = new RoamControl(viewer);
        roam.keyBind();
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((clk) => {
          res.push({
            ViewPoint: getCameraViewPoint(viewer),
            duration: 5,
          });
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction((clk) => {
          roam.startMapRoam(res);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      } else if (index === "1-1") {
        viewer.entities.add({
          name: "Red polygon on surface",
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
              -115.0, 37.0, -115.0, 32.0, -107.0, 33.0, -102.0, 31.0, -102.0,
              35.0,
            ]),
            material: Cesium.Color.RED,
            heightReference: Cesium.HeightReference.NONE,
          },
        });
      } else if (index === "1-0") {
        viewer.entities.add({
          name: "Red polygon with height",
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights([
              -115.0, 37.0, 500, -115.0, 32.0, 500, -107.0, 33.0, 500, -102.0,
              31.0, 500, -102.0, 35.0, 500,
            ]),
            material: Cesium.Color.RED,
            heightReference: Cesium.HeightReference.NONE,
          },
        });
      } else if (index === "1-2") {
        viewer.entities.add({
          name: "Red polygon extruded",
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
              -115.0, 37.0, -115.0, 32.0, -107.0, 33.0, -102.0, 31.0, -102.0,
              35.0,
            ]),
            material: Cesium.Color.RED,
            heightReference: Cesium.HeightReference.NONE,
            extrudedHeight: 800,
          },
        });
      } else if (index === "1-3") {
        viewer.entities.add({
          name: "Red polygon extruded",
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray([
              -115.0, 37.0, -115.0, 32.0, -107.0, 33.0, -102.0, 31.0, -102.0,
              35.0,
            ]),
            material: Cesium.Color.RED,
            extrudedHeight: 800,
            closeTop: false,
            closeBottom: true,
          },
        });
      } else if (index === "2-0") {
        const drawer = new PolygonDrawer({ viewer });
        drawer.stop();
        drawer.startDraw();
      } else if (index === "2-1") {
        const drawer = new PolygonDrawer({ viewer });
        drawer.stop();
        drawer.startPick();
      } else if (index === "2-2") {
        const drawer = new PolygonDrawer({ viewer });
        drawer.stop();
        drawer.startEdit();
      } else if (index === "2-3") {
        const drawer = new PolygonDrawer({ viewer });
        const data = {
          items: new Array(),
        };
        drawer._drawn.forEach((element) => {
          data.items.push({
            name: "TestPolygon_" + this.itr++,
            points: element.points,
          });
        });
        axios.post("http://localhost:8088/upload/geom", data);
        this.update(true);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.left-panel {
  position: absolute;
  top: 25vh;
  left: 5vw;
  width: 15vw;
  height: 55vh;
  background: #0e0e16c0;
  border-radius: 10px;
  overflow-x: hidden;
  overflow-y: auto;
}
::v-deep {
  .el-submenu {
    background: #000;
  }
  .el-submenu__title {
    color: white;
  }
  .el-submenu__title:hover {
    background: #000;
  }
}
</style>
