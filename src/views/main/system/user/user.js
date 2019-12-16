import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'

const TOTAL_OPTION_VALUE = 'total'
const STATUS_ENABLED_VALUE = 0
const STATUS_DISABLED_VALUE = 3

const state = {
  reqCancels: new Map(),
  searchName: '',
  searchTypeId: TOTAL_OPTION_VALUE,
  searchStatusId: TOTAL_OPTION_VALUE,
  searchRoleTypeList: [
    { label: '全部角色类型', value: TOTAL_OPTION_VALUE }
  ],
  searchStatusList: [
    { label: '全部状态', value: TOTAL_OPTION_VALUE },
    { label: '启用', value: STATUS_ENABLED_VALUE },
    { label: '停用', value: STATUS_DISABLED_VALUE }
  ],
  userList: [],
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  isLoadingUserList: false
}

const getters = {
}

const actions = {
  ...Actions,
  getUserListData ({ commit, state, getters, dispatch }) {
    let params = {
      q: state.searchName,
      pageSize: state.pageSize,
      pageIndex: state.currentPage
    }
    if (state.searchTypeId === null || state.searchTypeId === TOTAL_OPTION_VALUE) {
      delete params.type
    }
    let getUserListReq = api.user.getUserManage(params)
    commit(types.SET_DATA, { item: 'isLoadingUserList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getUserListReq', value: getUserListReq.cancel })
    getUserListReq.request.then(res => {
      let data = res.Data || []
      let searchRoleTypeList = state.searchRoleTypeList
      let searchStatusList = state.searchStatusList
      let userList = data.map(item => {
        return Object.assign({}, item, {
          RoleTypeText: searchRoleTypeList.find(type => (type.value === item.RoleType)).label,
          StatusText: searchStatusList.find(status => (status.value === item.RoleType)).label
        })
      })
      commit(types.SET_DATA, { item: 'userList', value: userList })
      commit(types.SET_DATA, { item: 'totalCount', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_DATA, { item: 'isLoadingUserList', value: false })
    })
  },
  getRoleType ({ commit, state, getters, dispatch }, canEdit = false) {
    let getRoleTypeReq = api.role.getRoleCreateType(canEdit)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoleTypeReq', value: getRoleTypeReq.cancel })
    getRoleTypeReq.request.then(res => {
      let data = res.Data || {}
      if (canEdit) {
        // 有编辑权限的角色列表
        let roleTypeList = Object.entries(data).map(([key, value]) => ({
          label: value,
          value: parseInt(key)
        }))
        let searchRoleTypeList = state.searchRoleTypeList.concat(roleTypeList)
        commit(types.SET_DATA, { item: 'searchRoleTypeList', value: searchRoleTypeList })
        commit(types.SET_DATA, { item: 'searchTypeId', value: searchRoleTypeList[0].value })
        dispatch('getUserListData')
      } else {
        // 创建角色的角色列表
        let editRoleTypeList = Object.entries(data).map(([key, value]) => ({
          label: value,
          value: parseInt(key)
        }))
        commit(types.SET_DATA, { item: 'editRoleTypeList', value: editRoleTypeList })
        commit(types.UPDATE_OBJ_DATA, { obj: 'editData', item: 'RoleType', value: editRoleTypeList.length ? editRoleTypeList[0].value : null })
      }
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
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
