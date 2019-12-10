import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'

const state = {
  reqCancels: new Map(),
  searchName: '',
  searchTypeId: null,
  searchRoleTypeList: [],
  roleList: [],
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  isShowEdit: false,
  isModify: false,
  editData: {
    RoleId: null,
    RoleName: '',
    RoleType: null,
    Menus: []
  },
  editRoleTypeList: []
}

const getters = {
}

const actions = {
  ...Actions,
  showEdit ({ commit, state, getters, dispatch }, { isShow, row }) {
    if (!isShow) {
    } else {
      if (row) {
        commit(types.SET_DATA, { item: 'isModify', value: true })
      } else {
        commit(types.SET_DATA, { item: 'isModify', value: false })
      }
    }
    commit(types.SET_DATA, { item: 'isShowEdit', value: isShow })
  },
  getRoleType ({ commit, state, getters, dispatch }, canEdit = false) {
    let getRoleTypeReq = api.role.getRoleCreateType(canEdit)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoleTypeReq', value: getRoleTypeReq.cancel })
    getRoleTypeReq.request.then(res => {
      let data = res.Data || {}
      if (canEdit) {
        // 有编辑权限的角色列表
        let searchRoleTypeList = Object.entries(data).map(([key, value]) => ({
          label: value,
          value: key
        }))
        commit(types.SET_DATA, { item: 'searchRoleTypeList', value: searchRoleTypeList })
        commit(types.SET_DATA, { item: 'searchTypeId', value: searchRoleTypeList.length ? searchRoleTypeList[0].value : null })
      } else {
        // 创建角色的角色列表
        let editRoleTypeList = Object.entries(data).map(([key, value]) => ({
          label: value,
          value: key
        }))
        commit(types.SET_DATA, { item: 'editRoleTypeList', value: editRoleTypeList })
        commit(types.UPDATE_OBJ_DATA, { obj: 'editData', item: 'RoleType', value: editRoleTypeList.length ? editRoleTypeList[0].value : null })
      }
    }).catch(err => {
      alert(err)
    })
  },
  getRoleListData ({ commit, state, getters, dispatch }) {
    let params = {
      q: state.searchName,
      pageSize: state.pageSize,
      pageIndex: state.currentPage
    }
    let getRoleListReq = api.role.getRoleList(params)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoleListReq', value: getRoleListReq.cancel })
    getRoleListReq.request.then(res => {
      let data = res.Data || []
      let roleList = data.map(item => {
        return Object.assign({}, item, {})
      })
      commit(types.SET_DATA, { item: 'roleList', value: roleList })
      commit(types.SET_DATA, { item: 'totalCount', value: res.Count })
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
