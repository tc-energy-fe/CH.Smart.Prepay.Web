import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'

const state = {
  reqCancels: new Map(),
  searchName: '',
  searchTypeId: null,
  searchRoleTypeList: [],
  roleList: []
}

const getters = {
}

const actions = {
  ...Actions,
  getRoleList ({ commit, state, getters, dispatch }) {
    let getRoleListReq = api.role.getRoleList({ q: '' })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoleListReq', value: getRoleListReq.cancel })
    getRoleListReq.request.then(res => {
      let data = res.Data || []
      let roleList = data.map(item => {
        return Object.assign(item, {})
      })
      console.log(roleList)
      commit(types.SET_DATA, { item: 'roleList', value: roleList })
    }).catch(err => {
      alert(err)
    }).finally(() => {
    })
  }
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
