import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'

// 按需引入element-ui组件
import { Tree, Table } from 'element-ui'
Vue.use(Tree)
Vue.use(Table)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
