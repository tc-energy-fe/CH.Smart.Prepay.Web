import Vue from 'vue'
import Login from './index.vue'

import { MessageBox } from 'element-ui'
import 'css/element-ui.scss'

Vue.config.productionTip = false
window.ElAlert = MessageBox.alert
window.ElConfirm = MessageBox.confirm

new Vue({
  render: h => h(Login)
}).$mount('#app')
