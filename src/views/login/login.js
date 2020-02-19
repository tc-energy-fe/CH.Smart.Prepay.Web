import Vue from 'vue'
import Login from './index.vue'

import { MessageBox } from 'element-ui'
import 'css/element-ui.scss'
// import 'tc-ui-lib/lib/style.css'

Vue.config.productionTip = false
window.ElAlert = MessageBox.alert
window.ElConfirm = MessageBox.confirm

new Vue({
  render: h => h(Login)
}).$mount('#app')
