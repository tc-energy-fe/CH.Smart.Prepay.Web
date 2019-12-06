import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'

import { Tree, Table, TableColumn, Pagination, Select, Option, Input, Loading } from 'element-ui'
import 'css/element-ui.scss'
import EgUi from 'tc-ui-lib'
import 'tc-ui-lib/lib/style.css'

// 按需引入element-ui组件
Vue.use(Tree)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Select)
Vue.use(Option)
Vue.use(Pagination)
Vue.use(Input)
Vue.use(Loading)

// 按需引入tc-ui组件
Vue.use(EgUi)

window.isEmpty = function (value) {
  return value === undefined || value === null
}

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
