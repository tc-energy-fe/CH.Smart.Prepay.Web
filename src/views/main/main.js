import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import { currency } from '@/utils/currency'

import { Tree, Table, TableColumn, Pagination, Select, Option, Input, Popover, Loading, MessageBox, Radio, RadioGroup, Checkbox, Dialog, Menu, Submenu, MenuItem, DatePicker, TimePicker, CheckboxButton, CheckboxGroup } from 'element-ui'
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
Vue.use(Popover)
Vue.use(Loading)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(Checkbox)
Vue.use(Dialog)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(DatePicker)
Vue.use(TimePicker)
Vue.use(CheckboxButton)
Vue.use(CheckboxGroup)
window.ElAlert = MessageBox.alert
window.ElConfirm = MessageBox.confirm

Vue.filter('currency', currency)

// 按需引入tc-ui组件
Vue.use(EgUi)

// 按需引入echarts
require('echarts/lib/chart/bar')
require('echarts/lib/chart/line')
require('echarts/lib/component/tooltip')

window.isEmpty = function (value) {
  return value === undefined || value === null
}

window.colorArr = ['#3d7dff', '#68c23b', '#ff7a8b']

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
