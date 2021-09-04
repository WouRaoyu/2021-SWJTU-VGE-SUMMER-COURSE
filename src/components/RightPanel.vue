<!--
 * @Author: WouRaoyu
 * @Date: 2021-09-03 10:49:46
 * @LastEditors: WouRaoyu
 * @LastEditTime: 2021-09-04 16:31:52
 * @Description: file content
-->

<template>
  <div class="right-panel">
    <h2 style="color: white">Right Panel</h2>
    <br />
    <div style="border: 1px solid white; margin: 10px; padding-bottom: 15px">
      <h3>路径漫游存档数据</h3>
      <span
        v-for="(item, key) in listRoam"
        v-bind:key="key"
        @click="handleClickRoam(key)"
      >
        路径漫游：{{ item.name }}
      </span>
    </div>
    <div style="border: 1px solid white; margin: 10px; padding-bottom: 15px">
      <h3>已绘多边形数据</h3>
      <div
        v-for="(item, key) in listGeom"
        v-bind:key="key"
        @click="handleClickGeom(key)"
      >
        <span> 已绘多边形：{{ item.name }} </span>
        <br />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapMutations, mapState } from "vuex";
import { Draw2dPolygon } from "../utils/PolygonDrawer.js"

export default {
  data() {
    return {
      listRoam: [],
      listGeom: [],
    };
  },
  watch: {
    dataUpdate: function (newVal) {
      if (newVal) {
        setTimeout(() => {
          axios.get("http://localhost:8088/info").then((response) => {
            this.listRoam = response.data.roam;
            this.listGeom = response.data.geom;
          });
        }, 500);
        this.update(false);
      }
    },
  },
  created() {
    axios.get("http://localhost:8088/info").then((response) => {
      this.listRoam = response.data.roam;
      this.listGeom = response.data.geom;
      console.log(response.data);
    });
  },
  computed: {
    ...mapState(["dataUpdate"]),
  },
  methods: {
    ...mapMutations(["update"]),
    handleClickRoam(index) {
      console.log(index);
    },
    handleClickGeom(index) {
      let item = this.listGeom[index];
      let entity = Draw2dPolygon(this.DTGlobe[0], item.points)
      this.DTGlobe[0].zoomTo(entity)
    }
  },
};
</script>

<style scoped>
.right-panel {
  position: absolute;
  top: 25vh;
  right: 5vw;
  width: 15vw;
  height: 55vh;
  background: #0e0e16c0;
  border-radius: 10px;
  color: whitesmoke;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>

