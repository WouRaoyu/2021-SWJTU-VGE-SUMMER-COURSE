/*
 * @Author: WouRaoyu
 * @Date: 2021-09-03 09:27:23
 * @LastEditors: WouRaoyu
 * @LastEditTime: 2021-09-03 11:10:01
 * @Description: file content
 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'

import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false

Vue.prototype.DTGlobe = new Array()

Vue.use(ElementUI)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
