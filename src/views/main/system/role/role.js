import Actions from '@/store/actions'
import Mutations from '@/store/mutations'
import * as types from '@/store/mutation-types'
import api from '@/api'
import initTree from '@/utils/tree'

const TOTAL_OPTION_VALUE = 'total'

const state = {
  reqCancels: new Map(),
  searchName: '',
  searchTypeId: TOTAL_OPTION_VALUE,
  searchRoleTypeList: [
    { label: '全部角色类型', value: TOTAL_OPTION_VALUE }
  ],
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
  editRoleTypeList: [],
  editTreeData: []
}

const getters = {
}

const actions = {
  ...Actions,
  showEdit ({ commit, state, getters, dispatch }, { isShow = true, row } = { isShow: true }) {
    if (!isShow) {
      // 清空表单
      commit(types.SET_DATA, {
        item: 'editData',
        value: {
          RoleId: null,
          RoleName: '',
          RoleType: null,
          Menus: []
        }
      })
      commit(types.SET_DATA, { item: 'editTreeData', value: [] })
    } else {
      if (row) {
        // 编辑模式
        commit(types.SET_DATA, { item: 'isModify', value: true })
        dispatch('getRoleMenus', row.CreatorId)
      } else {
        // 添加模式
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
        let roleTypeList = Object.entries(data).map(([key, value]) => ({
          label: value,
          value: parseInt(key)
        }))
        let searchRoleTypeList = state.searchRoleTypeList.concat(roleTypeList)
        commit(types.SET_DATA, { item: 'searchRoleTypeList', value: searchRoleTypeList })
        commit(types.SET_DATA, { item: 'searchTypeId', value: searchRoleTypeList[0].value })
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
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  getRoleListData ({ commit, state, getters, dispatch }) {
    let params = {
      q: state.searchName,
      type: state.searchTypeId,
      pageSize: state.pageSize,
      pageIndex: state.currentPage
    }
    if (state.searchTypeId === null || state.searchTypeId === TOTAL_OPTION_VALUE) {
      delete params.type
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
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
    })
  },
  getRoleMenus ({ commit, state, getters, dispatch }, uid) {
    let getRoleMenus = api.role.getRoleUserMenu(uid)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoleMenus', value: getRoleMenus.cancel })
    getRoleMenus.request.then(res => {
      let data = res.Data || []
      let treeData = initTree(data)
      commit(types.SET_DATA, { item: 'editTreeData', value: treeData })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  addRoleData ({ commit, state, getters, dispatch }) {
    let editData = state.editData
    let postData = {
      RoleName: editData.RoleName,
      RoleType: editData.RoleType,
      Menus: editData.Menus.map(menu => ({ Id: menu.value }))
    }
    let addRoleData = api.role.postRoleData(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'addRoleData', value: addRoleData.cancel })
    addRoleData.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
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
