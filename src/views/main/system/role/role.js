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
  editTreeData: [],
  singleRoleMenusTreeData: [],
  isLoadingRoleList: false
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
    } else {
      if (row) {
        // 编辑模式
        commit(types.SET_DATA, { item: 'isModify', value: true })
        dispatch('getRoleMenus', row.CreatorId)
        dispatch('getSingleRoleData', { id: row.RoleId, isEdit: true })
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
        let initType = { label: '全部角色类型', value: TOTAL_OPTION_VALUE }
        let searchRoleTypeList = [initType, ...roleTypeList]
        commit(types.SET_DATA, { item: 'searchRoleTypeList', value: searchRoleTypeList })
        commit(types.SET_DATA, { item: 'searchTypeId', value: searchRoleTypeList[0].value })
        dispatch('getRoleListData')
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
    commit(types.SET_DATA, { item: 'isLoadingRoleList', value: true })
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoleListReq', value: getRoleListReq.cancel })
    getRoleListReq.request.then(res => {
      let data = res.Data || []
      let searchRoleTypeList = state.searchRoleTypeList
      let roleList = data.map(item => {
        return Object.assign({}, item, {
          RoleTypeText: searchRoleTypeList.find(type => (type.value === item.RoleType)).label
        })
      })
      commit(types.SET_DATA, { item: 'roleList', value: roleList })
      commit(types.SET_DATA, { item: 'totalCount', value: res.Count })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    }).finally(() => {
      commit(types.SET_DATA, { item: 'isLoadingRoleList', value: false })
    })
  },
  getRoleMenus ({ commit, state, getters, dispatch }, uid) {
    let getRoleMenusReq = api.role.getRoleUserMenu(uid)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoleMenusReq', value: getRoleMenusReq.cancel })
    getRoleMenusReq.request.then(res => {
      let data = res.Data || []
      let treeData = initTree(data)
      commit(types.SET_DATA, { item: 'editTreeData', value: treeData })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  getSingleRoleData ({ commit, state, getters, dispatch }, { id, isEdit }) {
    let getSingleRoleDataReq = api.role.getSingleRole(id)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getSingleRoleDataReq', value: getSingleRoleDataReq.cancel })
    getSingleRoleDataReq.request.then(res => {
      let data = res.Data || {}
      if (isEdit) {
        commit(types.SET_DATA, { item: 'editData', value: Object.assign({}, state.editData, data) })
      } else {
        let singleRoleMenusTreeData = initTree(data.Menus || [])
        commit(types.SET_DATA, { item: 'singleRoleMenusTreeData', value: singleRoleMenusTreeData })
      }
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  addRoleData ({ commit, state, getters, dispatch }) {
    let editData = state.editData
    if (editData.RoleName === '') {
      ElAlert('请输入角色名称', '表单参数错误')
      return
    }
    if (editData.RoleType === null) {
      ElAlert('请选择角色类型', '表单参数错误')
      return
    }
    let postData = {
      RoleName: editData.RoleName,
      RoleType: editData.RoleType,
      Menus: editData.Menus.map(menu => ({ Id: menu.value }))
    }
    let addRoleDataReq = api.role.postRoleData(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'addRoleDataReq', value: addRoleDataReq.cancel })
    addRoleDataReq.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
      dispatch('getRoleListData')
      dispatch('showEdit', { isShow: false })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  saveRoleData ({ commit, state, getters, dispatch }) {
    let editData = state.editData
    if (editData.RoleName === '') {
      ElAlert('请输入角色名称', '表单参数错误')
      return
    }
    let postData = {
      RoleId: editData.RoleId,
      RoleName: editData.RoleName,
      RoleType: editData.RoleType,
      Menus: editData.Menus.map(menu => ({ Id: menu.Id }))
    }
    let saveRoleDataReq = api.role.putRoleData(postData)
    commit(types.ADD_REQUEST_CANCEL, { item: 'saveRoleDataReq', value: saveRoleDataReq.cancel })
    saveRoleDataReq.request.then(res => {
      commit(types.CHECKOUT_SUCCEED, res.State)
      dispatch('getRoleListData')
      dispatch('showEdit', { isShow: false })
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
