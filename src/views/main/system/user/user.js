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
  isLoadingUserList: false,
  isShowEdit: false,
  isModify: false,
  editData: {
    Id: null,
    AccountName: '',
    Password: '',
    UserName: '',
    RoleId: null,
    PhoneNo: '',
    Status: STATUS_ENABLED_VALUE,
    ProjectGroups: []
  },
  editRoleList: []
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
          Id: null,
          AccountName: '',
          Password: '',
          UserName: '',
          RoleId: null,
          PhoneNo: '',
          Status: STATUS_ENABLED_VALUE,
          ProjectGroups: []
        }
      })
    } else {
      if (row) {
        // 编辑模式
        commit(types.SET_DATA, { item: 'isModify', value: true })
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
        dispatch('getUserListData')
      } else {
      }
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
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
  getRoleListData ({ commit, state, getters, dispatch }, uid) {
    let params = {
      uid: 1109
    }
    let getRoleListReq = api.role.getRoleList(params)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getRoleListReq', value: getRoleListReq.cancel })
    getRoleListReq.request.then(res => {
      let data = res.Data || []
      let editRoleList = data.map(item => ({
        label: item.RoleName,
        value: item.RoleId
      }))
      commit(types.SET_DATA, { item: 'editRoleList', value: editRoleList })
    }).catch(err => {
      commit(types.CHECKOUT_FAILURE, err)
    })
  },
  getProjectGroupList ({ commit, state, getters, dispatch }, uid = 1109) {
    let getProjectGroupReq = api.project.getProjectGroupByUser(uid)
    commit(types.ADD_REQUEST_CANCEL, { item: 'getProjectGroupReq', value: getProjectGroupReq.cancel })
    getProjectGroupReq.request.then(res => {
      let data = res.Data || []
      console.log(data)
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
