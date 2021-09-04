/*
 * @Author: WouRaoyu
 * @Date: 2021-09-03 09:27:23
 * @LastEditors: WouRaoyu
 * @LastEditTime: 2021-09-04 15:49:22
 * @Description: file content
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    dataUpdate: false
  },
  mutations: {
    update(state, status) {
      state.dataUpdate = status
    }
  },
  actions: {
  },
  modules: {
  }
})
