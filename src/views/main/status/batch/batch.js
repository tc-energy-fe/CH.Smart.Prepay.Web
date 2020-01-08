import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
// import * as types from '@/store/mutation-types'
// import api from '@/api'

const state = {
  reqCancels: new Map(),
  currentPageEle: 1,
  pageSizeEle: 10,
  totalCountEle: 0
}

const getters = {
}

const actions = {
  ...Actions
}

const mutations = {
  ...Mutations
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
