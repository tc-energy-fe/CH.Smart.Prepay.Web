/*
* 模块公用的mutations
* */

import * as types from './mutation-types'
import ERROR_CODE from '@/api/error-code'

const Mutations = {
  [types.SET_DATA] (state, { item, value }) {
    if (state.hasOwnProperty(item)) {
      state[item] = value
    }
  },
  [types.UPDATE_FORM_VALUE] (state, { item, value }) {
    if (state.hasOwnProperty(item)) {
      state[item] = value
    }
  },
  [types.UPDATE_OBJ_DATA] (state, { obj, item, value }) {
    if (state.hasOwnProperty(obj)) {
      if (state[obj].hasOwnProperty(item)) {
        state[obj][item] = value
      }
    }
  },
  [types.ADD_REQUEST] (state, { item, value }) {
    state.requests.set(item, value)
  },
  [types.ABORT_REQUEST] (state, { item }) {
    let req = state.requests.get(item)
    if (req) {
      req.__abort = 1
      req.abort()
    }
  },
  [types.SET_LOADING_STATUS] (state, { item, value }) {
    if (state.hasOwnProperty(item)) {
      state[item] = value
    }
  },
  [types.SET_SELECT] (state, { item, key, value }) {
    if (state.hasOwnProperty(item)) {
      if (key) {
        if (Array.isArray(key)) {
          state[item].editSomeSelect(key, value)
        } else {
          state[item].editSelect(key, value)
        }
      } else {
        state[item].editAllSelect(value)
      }
    }
  },
  [types.CHECKOUT_FAILURE] (state, err) {
    console.log(err)
    if (err.code === -2) {
      alert({ key: 'account', content: '未登录或者登录信息过期', time: 2 })
      setTimeout(() => {
      }, 2000)
    } else if (err.code === -15) {
      alert({ key: 'account', content: '账号异地登录', time: 2 })
      setTimeout(() => {
        // router.push('/login')
      }, 2000)
    } else if (!err.hasOwnProperty('code')) {
      alert({ key: 'dataError', content: '数据错误或数据异常' })
    } else if (!err.abort) {
      let code = err.code.toString()
      let errorMsg = err.msg || ERROR_CODE['default'][code] || `未知错误${code}`
      alert({ key: 'msg', content: errorMsg })
    }
  },
  [types.CHECKOUT_SUCCEED] (state, stateCode) {
    if (stateCode === 0) {
      alert({ content: '执行成功' })
    }
  },
  [types.SET_BAR] (state, { item, value }) {
    if (state.hasOwnProperty(item)) {
      state[item].forEach(i => { i.checked = i.id === value })
    }
  }
}

export default Mutations
