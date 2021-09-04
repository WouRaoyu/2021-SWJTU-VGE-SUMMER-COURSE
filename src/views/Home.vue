<!--
 * @Author: WouRaoyu
 * @Date: 2021-09-03 09:27:23
 * @LastEditors: WouRaoyu
 * @LastEditTime: 2021-09-04 17:26:42
 * @Description: file content
-->
<template>
  <div class="home">
    <div id="title-name"> VGE-SWJTU小组数字孪生测试系统 </div>
    <img id="vge-logo" src="../assets/vge.png" />
    <div class="background" />
    <HelloWorld />
    <LeftPanel />
    <RightPanel />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import LeftPanel from "@/components/LeftPanel.vue"
import RightPanel from "@/components/RightPanel.vue"

export default {
  name: 'Home',
  components: {
    HelloWorld,
    LeftPanel,
    RightPanel
  }
}
</script>

<style scoped>
.home {
  width: 100%;
  height: 100%;
}
.background {
  width: 100%;
  height: 100%;
  z-index: 99;
  background-image: url("../assets/bg.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  position: absolute;
  pointer-events: none;
}
#title-name {
    top: 2vh;
    z-index: 100;
    color: white;
    width: 100%;
    font-size: 4vh;
    font-weight: bold;
    text-align: center;
    position: absolute;
    pointer-events: none;
}
#vge-logo {
    z-index: 100;
    width: 8vh;
    height: 8vh;
    left: 2vw;
    bottom: 5vh;
    position: absolute;
}
</style>
