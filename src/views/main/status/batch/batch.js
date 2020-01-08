import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
// import * as types from '@/store/mutation-types'
// import api from '@/api'

const state = {
  reqCancels: new Map(),
  currentNode: {},
  currentPageKeep: 1,
  pageSizeKeep: 10,
  totalCountKeep: 0
}

const getters = {
  currentNodeId: (state) => state.currentNode.Id
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
